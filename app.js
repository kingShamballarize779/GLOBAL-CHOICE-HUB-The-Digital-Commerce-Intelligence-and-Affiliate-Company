const categories=["Business & Creator Tools","Technology & Electronics","Travel & Experiences","Home & Living","Sustainable Living","Fashion & Lifestyle","Books & Learning","Creator & Digital Media"];
const categoryGrid=document.querySelector('#category-grid');
categoryGrid.innerHTML=categories.map((c,i)=>`<div class="category"><strong>${String(i+1).padStart(2,'0')} · ${c}</strong><small>Curated collection</small></div>`).join('');
let products=[];
fetch('data/products.json').then(r=>r.json()).then(data=>{products=data;render(products)}).catch(()=>render([]));
function render(items){const grid=document.querySelector('#product-grid');if(!items.length){grid.innerHTML='<div class="empty">No verified products are published yet. The catalogue boundary is intentionally empty.</div>';return}grid.innerHTML=items.map(p=>`<article class="category"><strong>${p.name}</strong><small>${p.category||'Uncategorized'}</small></article>`).join('')}
document.querySelector('#search').addEventListener('input',e=>{const q=e.target.value.toLowerCase();render(products.filter(p=>(p.name+' '+(p.category||'')).toLowerCase().includes(q)))});
