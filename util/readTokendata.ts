///<reference path='typescript-node-definitions/node.d.ts'/>

let assert = require('assert');
var BigNumber = require('bignumber.js');

class ReadTokendata{
	constructor(public helloWorld: string, private fPath:string) { }

	private readAsync= (fileNames:[string], theCompletion)=>{
		let fs = require('fs');


		let aCounter:number = 0;
		let aLastCounter:number = 0;
		let aList:{}[] = [];
		let aLog = {};
		fileNames.forEach ((fileName) =>{
			const aFileName = this.fPath + fileName;

			let aCompletion = (level) =>{
				return (err, data) => {
					if (aCounter !== aLastCounter){
						aLog ["" + level] = aCounter;
						aLastCounter = aCounter;
					}
					if (null === err){
						++aCounter;
						aList.push ({fileName:fileName, content: JSON.parse (data.toString ())});
					}
					else{
						/*
						{ Error: ENFILE: file table overflow, open '../tokendata/0x6983eafdc105a990cb51c21be463f85d498695dd.js'
							at Error (native)
							errno: -23,
							code: 'ENFILE',
							syscall: 'open',
							path: '../tokendata/0x6983eafdc105a990cb51c21be463f85d498695dd.js'
						}

						{ Error: EMFILE: too many open files, open '../tokendata/0x6dc635d6bebc50eb4e2639d964e0aabf959ea9f4.js'
							at Error (native)
							errno: -24,
							code: 'EMFILE',
							syscall: 'open',
							path: '../tokendata/0x6dc635d6bebc50eb4e2639d964e0aabf959ea9f4.js'
						}
						*/

						if ('ENFILE' === err.code || 'EMFILE' === err.code){
							setTimeout (()=>{
								fs.readFile (aFileName, aCompletion (level+1));
							});
						}
						else{
							console.log (err);
							throw err;
						}
					}
					if (aCounter === fileNames.length){
						// console.log (JSON.stringify (aList, null, 8));
						console.log (aLog);
						theCompletion (aList);
					}
				};
			};

			fs.readFile (aFileName, aCompletion (0));
		});
	}

	private readSync = (fileNames:[string]) => {
		let aList:{}[] = [];
		let fs = require('fs');
		fileNames.forEach ((fileName) =>{
			const aFileName = this.fPath + fileName;
			let data = fs.readFileSync (aFileName);
			aList.push ({fileName:fileName, content: JSON.parse (data.toString ())});
		});
		return aList;
	}
	private handleResult = (mode:string, theResult, theAmount:string)=>{
		let sigmaAmount = new BigNumber (0);
		let aLessThan = {};
		const aMedium = new BigNumber (""+theAmount);
		theResult.forEach ((theElement) => {
			const aBigNumber = new BigNumber (""+theElement.content.amount);

			const aCompared:number = aBigNumber.comparedTo (aMedium);
			if ("undefined" === typeof (aLessThan [aCompared])){
				aLessThan [aCompared] = {count:0, ratio:null};
			}
			++aLessThan [aCompared].count;
			sigmaAmount = sigmaAmount.plus (aBigNumber);
		});
		aLessThan ["-1"].ratio = aLessThan["-1"].count / theResult.length;
		aLessThan ["1"].ratio = aLessThan["1"].count / theResult.length;
		let aPartialAmount = new BigNumber (0);
		let aTreshold = {};
		theResult.some ((theElement, theIndex: number):boolean =>{
			const aBigNumber = new BigNumber (""+theElement.content.amount);
			aPartialAmount = aPartialAmount.plus (aBigNumber);
			let ret: boolean = false;
			if (1 === aPartialAmount.comparedTo (sigmaAmount.dividedBy (2))){
				aTreshold = {
					index:{
						absolute:theIndex,
						ratio:theIndex/theResult.length
					},
					amount:aPartialAmount.toString (10),
					referenceAmount:aMedium.toString (10)
				};
				ret = true;
			}
			return ret;
		});
		console.log (JSON.stringify ({mode:mode, listLength: theResult.length, sigmaAmount:sigmaAmount.toString (10), treshold:aTreshold, lessThan:aLessThan}, null, 8));
	}
	private test = (theMode:string, theAmount:string)=>{
		let fs = require('fs');
		const aPath:string = this.fPath;
		fs.readdir(aPath, (error, files) =>{
			assert (null ===  error);
			let aFiles: [string] = [''];
			aFiles.pop ();
			files.forEach ((fileName:string) => {
				const kPrefix = "0x";
				const aPrefix = fileName.substr (0, kPrefix.length);
				if (kPrefix === aPrefix){
					aFiles.push (fileName);
				}
			});
			// console.log ({aFilesLength:aFiles.length});
			if ('async' === theMode){
				this.readAsync (aFiles, (theResult) =>{
					this.handleResult (theMode, theResult, theAmount);
				})
			}
			else{
				let aResult = this.readSync (aFiles);
				this.handleResult (theMode, aResult, theAmount);
			}
		});
	}

	public main = () => {

		let aMode = process.argv [2];
		if ("undefined" == typeof (aMode)){
			aMode = "sync";
		}
		let aAmount:string = process.argv [3];
		if ("undefined" == typeof (aAmount)){
			aAmount = "225343873517786561343";
		}
		assert (("async" === aMode) || ("sync" === aMode));
		this.test (aMode, aAmount);
	}
};

var gController = new ReadTokendata("Hello, world!", "../tokendata/");
gController.main ();
