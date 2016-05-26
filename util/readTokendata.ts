declare function require(module:string);

class ReadTokendata{
	constructor(public helloWorld: string, private fPath:string) { }
	
	private readAsync= (fileNames:[string], theCompletion)=>{
		let fs = require('fs');
		let assert = require('assert');

		let aCounter = 0;
		let aList:{}[] = [];
		fileNames.forEach ((fileName) =>{
			const aFileName = this.fPath + fileName;
			fs.readFile (aFileName, function (err, data){
				++aCounter;
				if (null === err){
					aList.push ({fileName:fileName, content: JSON.parse (data.toString ())});
				}
				else{
					console.log ({err: err});
				}
				if (aCounter === fileNames.length){
					// console.log (JSON.stringify (aList, null, 8));
					theCompletion (aList);
				}
			});
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
				const kPrefix = "0x"
				const aPrefix = fileName.substr (0, kPrefix.length);
				if (kPrefix === aPrefix){
					aFiles.push (fileName);
				}
			});
			console.log ({aFilesLength:aFiles.length});
			/*
			this.readAsync (aFiles, function (theResult){
				console.log ({aListLength: theResult.length});
			})
			*/
			let aResult = this.readSync (aFiles);
			console.log ({aListLength: aResult.length});
		});
	}

	public main = () => {
		this.test ();
	}
};

var gController = new ReadTokendata("Hello, world!", "../tokendata/");
gController.main ();
