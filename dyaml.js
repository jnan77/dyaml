const yaml = require('js-yaml');
const fs = require('fs');
/**
 * 
 * @param {*} input 源文件
 * @param {*} deleteArgs 删除key集合，支持a/a.b/a.b.c格式
 * @param {*} output 新内容保存文件
 */
function cleanYaml(input,output,deleteArgs){
  try {
    let doc = yaml.load(fs.readFileSync(input, 'utf8'));
    for (j = 0,l=deleteArgs.length; j < l; j++) {
      let deleteArg = deleteArgs[j];
      let deletePops = deleteArg.split("\.");
      var tmp = doc;
      for (let i = 0,l2=deletePops.length; i < l2; i++) {
        if (tmp !== undefined && i == l2 - 1) {
          delete tmp[deletePops[i]];
          console.log('删除节点 : ' + deleteArg)
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
  }
  return output;
}
try {
  const args = process.argv.slice(2);
  const realArgs = parse(args);
  if(args.length==0||realArgs.filter(item => item!=undefined).length!=3){
    console.log(`
    请设置cyaml必要参数。
    -i=待处理yaml格式文件完整路径 
    -o=处理后保存文件完整路径 
    -d=目标删除属性，支持多级匹配，如：a,b.c,c.d.f，多个通过逗号分隔
    `);
    return;
  }
  console.log("当前参数为：",realArgs);
  cleanYaml(realArgs[0],realArgs[1],realArgs[2]);
} catch (e) {
  console.log(e);
}
