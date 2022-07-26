// v1.8
const settings = {
	minus255ToPlus255: false, // whether the range should be -255 ~ 255 and not 0 ~ 255
	windowsLineBreak: true // whether to use \r\n instead of \n
}


const fs = require("fs/promises");
var pr,
	jspr = {
		data: "",
		tab: 0,
		add: function(d){
			this.data += d;
		},
		prev: "",
		addline: function(d){
			if(this.prev != d) {
				let tabs = "";
				if(this.tab > 0)for(let t=0;t<this.tab;t++)tabs+="	";
				this.data += (this.data.length==0?"":(settings.windowsLineBreak?"\r\n":"\n"))+tabs+d;
				this.prev = d;
			} else {
				this.data += d;
			}
		}
	},
	arg = [...process.argv].splice(2);
async function main() {
	if(!arg[0]) {
		console.log('No file specified!');
		process.exit(1);
		return;
	}
	let filename = arg[0].toString().trim(),
		filename2;
	try {
		filename2 = arg[1].toString().trim();
	}catch(e){}
	try {
		if(filename2)console.log("Loading " + filename);
		pr = await fs.readFile(filename,"utf8");
		if(pr == '') throw new Error('The program is empty!');
	} catch (e) {
		console.error("Failed to load the program from a file. " + e);
		process.exit(1);
		return;
	}
	if(filename2)console.log("Converting...");
	jspr.addline('let a=new Array(3e4),i=0,c=-1,p=[...process.argv].splice(2),w=v=>((v-'+'l)%(256-l)+(256-l))%(256-l)+l'.replaceAll('l',settings.minus255ToPlus255?'(-255)':'0')+';Object.seal&&(a.fill(0),Object.seal(a));');
	let count = 0;
	for(let i = 0; i < pr.length; i++) {
		count = 0;
		switch(pr[i]) {
			case "+":
			for(let o = 0; pr[i+o] == '+'; o++) {
				count++;
			}
			i += count-1;
			jspr.addline('a[i]=w(a[i]+'+count+');');
			break;
			case "-":
			for(let o = 0; pr[i+o] == '-'; o++) {
				count++;
			}
			i += count-1;
			jspr.addline('a[i]=w(a[i]-'+count+');');
			break;
			case ">":
			for(let o = 0; pr[i+o] == '>'; o++) {
				count++;
			}
			i += count-1;
			jspr.addline('i=Math.min(3e4,i+'+count+');');
			break;
			case "<":
			for(let o = 0; pr[i+o] == '<'; o++) {
				count++;
			}
			i += count-1;
			jspr.addline('i=Math.max(0,i-'+count+');');
			break;
			case "[":
			jspr.addline("for(;0!=a[i];) {");
			jspr.tab++;
			break;
			case "]":
			if(jspr.tab > 0) jspr.tab--;
			jspr.addline("}");
			break;
			case ".":
			jspr.addline('process.stdout.write(String.fromCharCode(a[i]));');
			break;
			case ",":
			jspr.addline('c++,a[i]=p[0]?p[0].charCodeAt(c)?p[0].charCodeAt(c):0:0;');
			break;
		}
	}
	if(filename2) {
		console.log("Conversion finished.");
		await fs.writeFile(filename2,jspr.data);
		console.log("Saved in " + filename2 + " (~" + Math.floor(jspr.data.length / 1024) + "kb of data)");
	} else {
		console.log(jspr.data);
	}
}
main();