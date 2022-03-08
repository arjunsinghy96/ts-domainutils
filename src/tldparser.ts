import axios from "axios";

interface TldParserTree {
    split_tld(domain: string): object;
}

export type DomainData = {
    full_domain: string,
    domain_name: string,
    tld: string
}

export class TldParser implements TldParserTree {

    private domain_exceptions: Set<string> = new Set();
    private trie: Object = {};
    private initalized: boolean = false;
    private initCall: Promise<void>;

    constructor() {
        this.initCall = this.init()
    }

    /**
     * Calls build_tld_trie and sets initialized to true
     */
    private async init() {
        if (!this.initalized){
            await this.build_tld_trie();
            this.initalized = true;
        }
    }

    /**
     * Gets the list of all public TLD suffix from https://publicsuffix.org/list/public_suffix_list.dat
     * 
     * For more details on parsing visit https://publicsuffix.org/list/
     * 
     * This method should be caled from build_tld_tire
     * 
     * @returns Promise<Array<sting> | void>
     */
    private get_tld_list() {
        return axios.get("https://publicsuffix.org/list/public_suffix_list.dat")
            .then(
                response => {
                    return response.data.split('\n').filter((domain: string) => {
                        return !domain.startsWith('//') && domain !== ''
                    });
                }
            ).catch(
                error => {
                    console.log(error);
                }
            );
    }

    /**
     * Construct a tire after fetching the TLD list by calling this.get_tld_list
     */
    private async build_tld_trie() {
        var tld_list: Array<string> = await this.get_tld_list();
        for (let tld of tld_list) {
            if (tld.startsWith('!')) {
                this.domain_exceptions.add(tld.replace('!', ''));
                continue;
            }
            let root = this.trie;
            // We create the tire from end of the domain. Therefore, reversed.
            for (let part of tld.split('.').reverse()){
                let node = root[part];
                if (!!!node) {
                    node = {};
                    root[part] = node;
                }
                root = node
            }
        }
        this.initalized = true;
    }

    /**
     * Splits the domain into name and tld.
     * 
     * @param domain The domain to be split
     * @returns DomainData
     */
    async split_tld(domain: string): Promise<DomainData> {
        if (!this.initalized) {
            console.log("TldParser is not ready to be used");
            await this.initCall;
        }
        var tld = [];
        var parts = domain.split(".");
        if (this.domain_exceptions.has(domain)){
            return {
                tld: parts.slice(1).join('.'),
                full_domain: domain,
                domain_name: parts[0]
            }
        }

        let sub = this.trie;
        while (parts.length > 0 && sub !== null) {
            let part = parts.pop()
            let next_node = sub[part]
            if (!(part in sub)){
                if (!('*' in sub)) {
                    sub = null
                    parts.push(part)
                    continue
                }
                next_node = {}
            }
            tld.push(part)
            sub = next_node
        }
        return {
            tld: tld.reverse().join('.'),
            full_domain: domain,
            domain_name: parts.join('.')
        }
    }
}

