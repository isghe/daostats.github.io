declare function require(module:string);

class ReadTokendata{
	constructor(public helloWorld: string, private fPath:string) { }
	
	private readAsync= (fileNames:[string], theCompletion)=>{
		let fs = require('fs');
		let assert = require('assert');

		let aCounter:number = 0;
		let aLastCounter:number = 0;
		let aList:{}[] = [];
		fileNames.forEach ((fileName) =>{
			const aFileName = this.fPath + fileName;

			let aCompletion = (level) =>{
					return (err, data) => {
					if (aCounter !== aLastCounter){
						// console.log ({level:level, aCounter:aCounter});
						aLastCounter = aCounter;
					}
					if (null === err){
						++aCounter;
						aList.push ({fileName:fileName, content: JSON.parse (data.toString ())});
					}
					else{
						setTimeout (()=>{
							fs.readFile (aFileName, aCompletion (level+1));
						})
					}
					if (aCounter === fileNames.length){
						// console.log (JSON.stringify (aList, null, 8));
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
	
	private test = ()=>{
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
			if (1){
				this.readAsync (aFiles, function (theResult){
					console.log ({mode:"async", aListLength: theResult.length});
				})
			}
			else{
				let aResult = this.readSync (aFiles);
				console.log ({mode:"sync", aListLength: aResult.length});
			}
		});
	}

	public main = () => {
		this.test ();
	}
};

var gController = new ReadTokendata("Hello, world!", "../tokendata/");
gController.main ();
