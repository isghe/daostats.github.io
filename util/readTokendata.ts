declare function require(module:string);

class ReadTokendata{
	constructor(public helloWorld: string, private fPath:string) { }

	private readAsync= (fileNames:[string], theCompletion)=>{
		let fs = require('fs');
		let assert = require('assert');

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
	private handleResult = (mode:string, theResult)=>{
		console.log ({mode:mode, aListLength: theResult.length});
	}
	private test = (theAsync: boolean)=>{
		let fs = require('fs');
		let assert = require('assert');
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
			console.log ({aFilesLength:aFiles.length});
			if (true === theAsync){
				this.readAsync (aFiles, (theResult) =>{
					this.handleResult ("async", theResult);
				})
			}
			else{
				let aResult = this.readSync (aFiles);
				this.handleResult ("sync", aResult);
			}
		});
	}

	public main = () => {
		this.test (true);
	}
};

var gController = new ReadTokendata("Hello, world!", "../tokendata/");
gController.main ();
