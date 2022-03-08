import * as inquirer from 'inquirer';
import { TldParser, DomainData } from './tldparser';

const parser = new TldParser();

const questions: Array<object> = [
    {
        type: "input",
        name: "domain",
        message: "Enter the domain for parsing"
    }
]

inquirer.prompt(questions).then(answers => {
    parser.split_tld(answers.domain).then((res) => {
        console.log(res);
    }).catch(err => {
        console.log(err)
    });
})