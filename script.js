const map = document.getElementById("map");
const svg = document.getElementById("connections");
const editor = document.getElementById("editor");
const editStep = document.getElementById("editStep");
const editTitle = document.getElementById("editTitle");
const editInfo = document.getElementById("editInfo");

let nodes = [];
let edges = [];
let nextId = 1;
let editingId = null;
let connecting = false;
let connectFrom = null;
let drag = null;

const initialNodes = [
  {step:"01 • ESTRATÉGIA",title:"🎯 Pesquisa de Mercado",info:"Público\\nProblema\\nDesejo\\nConcorrentes\\nDemanda",x:30,y:70},
  {step:"02 • OFERTA",title:"📦 Produto / Oferta",info:"Problema que resolve\\nPromessa\\nBenefícios\\nPreço\\nBônus",x:260,y:70},
  {step:"03 • POSICIONAMENTO",title:"👤 Marca",info:"Nome\\nAutoridade\\nIdentidade visual\\nDiferencial",x:490,y:70},
  {step:"04 • AQUISIÇÃO",title:"📱 Conteúdo",info:"TikTok\\nInstagram\\nYouTube\\nFacebook\\nReels / Shorts",x:30,y:250},
  {step:"05 • TRÁFEGO",title:"🚀 Tráfego Pago",info:"Meta Ads\\nGoogle Ads\\nTikTok Ads\\nRetargeting",x:260,y:250},
  {step:"06 • CAPTURA",title:"🎁 Isca Digital",info:"E-book\\nChecklist\\nAula gratuita\\nLead magnet",x:490,y:250},
  {step:"07 • RELACIONAMENTO",title:"💬 WhatsApp / Comunidade",info:"Grupo da comunidade\\nConteúdo exclusivo\\nAvisos\\nLives\\nRelacionamento",x:30,y:430},
  {step:"08 • NUTRIÇÃO",title:"🧠 Follow-up",info:"WhatsApp\\nEmail\\nStories\\nProvas\\nObjeções\\nEducação",x:260,y:430},
  {step:"09 • CONVERSÃO",title:"💰 Página de Venda",info:"Headline\\nOferta\\nBenefícios\\nProvas\\nFAQ\\nCTA",x:490,y:430},
  {step:"10 • CHECKOUT",title:"💳 Pagamento",info:"Checkout\\nM-Pesa / e-Mola\\nCartão\\nConfirmação",x:260,y:580},
  {step:"11 • ENTREGA",title:"📚 Entrega",info:"Área do aluno\\nPDF\\nVídeos\\nMateriais\\nAcesso",x:30,y:580},
  {step:"12 • PÓS-VENDA",title:"⭐ Cliente & Escala",info:"Suporte\\nFeedback\\nDepoimentos\\nUpsell\\nIndicação\\nEscala",x:490,y:580}
];

const initialEdges = [
  [1,2],[2,3],[1,4],[1,5],[4,6],[5,6],[6,7],[7,8],[8,9],
  [9,10],[10,11],[11,12]
];

function addNode(data){
  nodes.push({...data,id:nextId++});
}

function render(){
  document.querySelectorAll(".node").forEach(n=>n.remove());

  nodes.forEach(n=>{
    const el=document.createElement("div");
    el.className="node"+(editingId===n.id?" selected":"");
    el.dataset.id=n.id;
    el.style.left=n.x+"px";
    el.style.top=n.y+"px";

    const step=document.createElement("div");
    step.className="step";
    step.textContent=n.step||"NOVA ETAPA";

    const h3=document.createElement("h3");
    h3.textContent=n.title||"Sem título";

    const p=document.createElement("p");
    p.textContent=n.info||"Sem informações";

    const actions=document.createElement("div");
    actions.className="actions";

    const edit=document.createElement("button");
    edit.type="button"; edit.textContent="Editar";

    const del=document.createElement("button");
    del.type="button"; del.textContent="Excluir";

    actions.append(edit,del);
    el.append(step,h3,p,actions);

    edit.addEventListener("pointerdown",e=>e.stopPropagation());
    del.addEventListener("pointerdown",e=>e.stopPropagation());

    edit.addEventListener("click",()=>openEditor(n));
    del.addEventListener("click",()=>removeNode(n.id));

    el.addEventListener("click",()=>{
      if(!connecting)return;
      if(connectFrom===null){
        connectFrom=n.id;
        el.classList.add("selected");
      }else if(connectFrom!==n.id){
        const exists=edges.some(e=>
          (e.a===connectFrom&&e.b===n.id)||
          (e.a===n.id&&e.b===connectFrom)
        );
        if(!exists)edges.push({a:connectFrom,b:n.id});
        connecting=false;
        connectFrom=null;
        render();
      }
    });

    el.addEventListener("pointerdown",startDrag);
    map.appendChild(el);
  });

  drawEdges();
}

function drawEdges(){
  svg.innerHTML="";
  edges.forEach(edge=>{
    const a=nodes.find(n=>n.id===edge.a);
    const b=nodes.find(n=>n.id===edge.b);
    if(!a||!b)return;

    const line=document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1",a.x+95);
    line.setAttribute("y1",a.y+48);
    line.setAttribute("x2",b.x+95);
    line.setAttribute("y2",b.y+48);
    line.setAttribute("stroke","#666d7a");
    line.setAttribute("stroke-width","2");
    svg.appendChild(line);
  });
}

function startDrag(e){
  if(e.target.closest("button")||connecting)return;
  const node=nodes.find(n=>n.id===Number(e.currentTarget.dataset.id));
  if(!node)return;

  drag={node,px:e.clientX,py:e.clientY,x:node.x,y:node.y};
  e.currentTarget.setPointerCapture(e.pointerId);
  e.currentTarget.addEventListener("pointermove",moveDrag);
  e.currentTarget.addEventListener("pointerup",endDrag,{once:true});
}

function moveDrag(e){
  if(!drag)return;
  drag.node.x=Math.max(0,drag.x+e.clientX-drag.px);
  drag.node.y=Math.max(0,drag.y+e.clientY-drag.py);
  e.currentTarget.style.left=drag.node.x+"px";
  e.currentTarget.style.top=drag.node.y+"px";
  drawEdges();
}

function endDrag(e){
  e.currentTarget.removeEventListener("pointermove",moveDrag);
  drag=null;
  render();
}

function openEditor(n){
  editingId=n.id;
  editStep.value=n.step||"";
  editTitle.value=n.title||"";
  editInfo.value=n.info||"";
  editor.classList.remove("hidden");
  render();
  editTitle.focus();
}

function closeEditor(){
  editingId=null;
  editor.classList.add("hidden");
  render();
}

function removeNode(id){
  nodes=nodes.filter(n=>n.id!==id);
  edges=edges.filter(e=>e.a!==id&&e.b!==id);
  if(editingId===id)closeEditor();
  render();
}

document.getElementById("saveNode").addEventListener("click",()=>{
  const n=nodes.find(x=>x.id===editingId);
  if(!n)return;
  n.step=editStep.value.trim()||"NOVA ETAPA";
  n.title=editTitle.value.trim()||"Sem título";
  n.info=editInfo.value.trim()||"Sem informações";
  render();
});

document.getElementById("closeEditor").addEventListener("click",closeEditor);

document.getElementById("addNode").addEventListener("click",()=>{
  addNode({
    step:"NOVA ETAPA",
    title:"Novo bloco",
    info:"Adicione suas informações aqui",
    x:Math.min(500,80+Math.random()*380),
    y:Math.min(580,80+Math.random()*400)
  });
  render();
});

document.getElementById("connectMode").addEventListener("click",()=>{
  connecting=true;
  connectFrom=null;
  alert("Modo conexão ativo: clique no primeiro bloco e depois no segundo.");
});

document.getElementById("resetMap").addEventListener("click",()=>{
  if(!confirm("Restaurar o mapa original? Alterações atuais serão perdidas."))return;
  loadInitial();
});

document.getElementById("exportJson").addEventListener("click",()=>{
  const data=JSON.stringify({nodes,edges},null,2);
  const blob=new Blob([data],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="marketing-mindmap.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("importJson").addEventListener("click",()=>{
  document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change",e=>{
  const file=e.target.files[0];
  if(!file)return;

  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      if(!Array.isArray(data.nodes)||!Array.isArray(data.edges))throw new Error();
      nodes=data.nodes;
      edges=data.edges;
      nextId=Math.max(0,...nodes.map(n=>Number(n.id)||0))+1;
      closeEditor();
      render();
    }catch{
      alert("Arquivo de mapa inválido.");
    }
  };
  reader.readAsText(file);
});

function loadInitial(){
  nodes=[];
  edges=[];
  nextId=1;
  initialNodes.forEach(addNode);
  edges=initialEdges.map(([a,b])=>({a,b}));
  closeEditor();
  render();
}

loadInitial();
