const fs=require('fs');
const ELK=require('elkjs/lib/elk.bundled.js');
const elk=new ELK();
(async()=>{
 const input=JSON.parse(fs.readFileSync(__dirname+'/layout-input.json','utf8')),out={};
 for(const [name,graph] of Object.entries(input)){
  graph.layoutOptions={'elk.algorithm':'layered','elk.direction':'RIGHT','elk.edgeRouting':'ORTHOGONAL','elk.spacing.nodeNode':'100','elk.layered.spacing.nodeNodeBetweenLayers':'180','elk.spacing.edgeNode':'35','elk.layered.spacing.edgeNodeBetweenLayers':'50','elk.layered.considerModelOrder.strategy':'NODES_AND_EDGES'};
  out[name]=await elk.layout(graph);
 }
 fs.writeFileSync(__dirname+'/layouts.json',JSON.stringify(out));
 console.log(Object.keys(out).length+' diagram layouts');
})();
