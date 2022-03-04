const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path')
let showLog = false;
/**
 * 
 * @param {*} input 源文件
 * @param {*} deleteArgs 删除key集合，支持a/a.b/a.b.c格式
 * @param {*} output 新内容保存文件
 */
function cleanYml(input,output,deleteArgs){
  try {
    let doc = yaml.load(fs.readFileSync(input, 'utf8'));
    for (j = 0,l=deleteArgs.length; j < l; j++) {
      let deleteArg = deleteArgs[j];
      let deletePops = deleteArg.split("\.");
      var tmp = doc;
      for (let i = 0,l2=deletePops.length; i < l2; i++) {
        if (tmp !== undefined && i == l2 - 1) {
          delete tmp[deletePops[i]];
          if(showLog){
            console.log('删除文件【'+input+'】节点为【' + deleteArg+'】的数据')
          }
          break;
        }
        if (tmp[deletePops[i]]) {
          tmp = tmp[deletePops[i]];
        }
      }
    }
    fs.writeFileSync(output, yaml.dump(doc), 'utf8');
  } catch (e) {
    console.log(e);
  }
}
function cleanYmlDir(dir,deleteArgs){
  try {
    const files = getYmlFiles([],dir)
    files.forEach(input => {
      cleanYml(input,input,deleteArgs);
    });
  } catch (e) {
    console.log(e);
  }
}
/**
 * 
 * @param {*} ymlFiles yaml文件集合，由于使用递归方式，所以需要设置默认[]
 * @param {*} url 文件路径，当前路径为./
 * @returns 
 */
function getYmlFiles(ymlFiles,url) {
  const files = fs.readdirSync(url);   
  files.forEach( function (file){
    var stats = fs.statSync(url+file)
    if(stats.isFile()) {
      const extName =path.extname(url+file);
      if(extName === ".yaml"||extName===".yml") {
        const realPath = path.resolve(url,file);
        ymlFiles.push(realPath);
      }
    } else if(stats.isDirectory()) {
      return getYmlFiles(ymlFiles,url+file+'/')
    }   
  });
  return ymlFiles;
}
function parse(args = []) {
  // _ 属性用来保留不需要处理的参数字符串
  let output = [];
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if(arg.startsWith('-i')){
      output[0]=arg.split("=")[1];
    }
    if(arg.startsWith('-o')){
      output[1]=arg.split("=")[1];
    }
    if(arg.startsWith('-d')){
      output[2]=arg.split("=")[1].split(",");
    }
    if(arg.startsWith('-r')){
      output[3]=arg.split("=")[1];
    }
    if(arg.startsWith('-x')){
      showLog=true;
    }
  }
  return output;
}
function help(){
  console.log(`--------------------nyml使用帮助------------------------
参数说明：
-i=待处理yaml格式文件完整路径 
-o=处理后保存文件完整路径 
-d=目标删除属性，支持多级匹配，如：a,b.c,c.d.f，多个通过逗号分隔
-r=待处理yml或yaml文件的目录,当前目录=./
-x:打印处理日志

方式一（单个文件处理）：nyml -i=input.yml -o=output.yml -d=deletePop1
方式二（目录所有.yml/.yaml处理）：nyml -r=./ -d=deletePop1
--------------------------------------------------------
  `);
}
function checkArgs(args = []){
  const len = args.filter(item => item!=undefined).length;
  if(len<2){
    help();
    return false;
  }
  if(args[2]==undefined){
    console.log("-d参数不能为空");
    return false;
  }
  if(len==2&&args[3]==undefined||args[3]==""){
    console.log("参数有误！");
    help();
    return false;
  }
  return true;
}

try {
  const args = process.argv.slice(2);
  const realArgs = parse(args);
  if(!checkArgs(realArgs)){
    return;
  }
  if(realArgs.length==4){
    console.log("当前参数为：",realArgs[3],realArgs[2]);
    cleanYmlDir(realArgs[3],realArgs[2]);
    return;
  }
  if(args.length==0||realArgs.filter(item => item!=undefined).length!=3){
    help();
    return;
  }
  console.log("当前参数为：",realArgs);
  cleanYml(realArgs[0],realArgs[1],realArgs[2]);
} catch (e) {
  console.log(e);
}
