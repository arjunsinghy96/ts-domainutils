import { TldParser } from "./tldparser";

describe('TldParser.split_tld', () => {
    var parser: TldParser;
    beforeAll(() => {
        parser = new TldParser();
    })

    test('that TLD is correctly identified for normal domains', () => {
        parser.split_tld('google.com').then(res => {
            expect(res.domain_name).toBe('google')
            expect(res.tld).toBe('com')
        })
        parser.split_tld('facebook.in').then(res => {
            expect(res.domain_name).toBe('facebook')
            expect(res.tld).toBe('in')
        })
    })

    test('that TLD is correctly identified for multi-level domains', () => {
        parser.split_tld('harvard.ac.in').then(res => {
            expect(res.domain_name).toBe('harvard');
            expect(res.tld).toBe('ac.in');
        })
    })

    test('that exception TLD are recognized', () => {
        parser.split_tld('www.ck').then(res => {
            expect(res.domain_name).toBe('www');
            expect(res.tld).toBe('ck')
        })
    })
})