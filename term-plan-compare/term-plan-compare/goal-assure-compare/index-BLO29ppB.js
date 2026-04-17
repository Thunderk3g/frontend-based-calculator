(function(){const l=document.createElement("link").relList;if(l&&l.supports&&l.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const t of n)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function s(n){const t={};return n.integrity&&(t.integrity=n.integrity),n.referrerPolicy&&(t.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?t.credentials="include":n.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function a(n){if(n.ep)return;n.ep=!0;const t=s(n);fetch(n.href,t)}})();const me={BASE_URL:"/term-plan-compare/goal-assure-compare/",DEV:!1,MODE:"production",PROD:!0,SSR:!1},H=typeof import.meta<"u"&&me&&"/term-plan-compare/goal-assure-compare/"||"./";let y={version:"Unknown",updatedAt:"Unknown",ratesLoadedCount:0,charges:{allocation:{web:[],other:[]},pac:{},pacInflationRate:.05,fmc:{}},saMultipliers:{below45:10,above45:10},constraints:{minAge:0,maxAge:60,maxMaturityAge:75,minPremium:25e3}};async function fe(){try{const[e,l,s]=await Promise.all([fetch(`${H}extracted_data.json`),fetch(`${H}charges.json`),fetch(`${H}version_control.json`)]);if(!e.ok||!l.ok){console.warn("Failed to load JSONs, using hardcoded defaults");return}const a=await e.json(),n=await l.json();let t=null;s.ok&&(t=await s.json());const i=Array.isArray(t)&&t.length>0?t[t.length-1]:null;i&&(y.version=`BI_Goal Assure IV_V01_${i[2]||"ver18"}`,y.updatedAt=i[0]?new Date((i[0]-25569)*86400*1e3).toLocaleDateString():new Date().toLocaleDateString()),n&&(y.charges=n);const c=a.Input||[];for(let r of c)if(r[0]==="Sum Assured Factor"){y.saMultipliers.min=parseFloat(r[3])||7,y.saMultipliers.max=parseFloat(r[5])||20,y.saMultipliers.default=parseFloat(r[3])||10;break}console.log("CONFIG loaded from JSON:",y)}catch(e){console.error("Error loading config:",e)}}const ve={BASE_URL:"/term-plan-compare/goal-assure-compare/",DEV:!1,MODE:"production",PROD:!0,SSR:!1},q=typeof import.meta<"u"&&ve&&"/term-plan-compare/goal-assure-compare/"||"./";let M=null,J=null,Z=null;const be=25e4,ge=125e3,ye=.125;async function he(){try{const[e,l,s]=await Promise.all([fetch(`${q}apr_rates.json`).catch(()=>({ok:!1})),fetch(`${q}ci_rates.json`).catch(()=>({ok:!1})),fetch(`${q}care_plus_rates.json`).catch(()=>({ok:!1}))]);e&&e.ok&&(M=await e.json()),l&&l.ok&&(J=await l.json()),s&&s.ok&&(Z=await s.json()),y.ratesLoadedCount=[M,J,Z].filter(Boolean).length,console.log(`Loaded ${y.ratesLoadedCount} rate tables`)}catch(e){console.error("Error loading rate tables:",e)}}function $e(e){const l=[];(e.age<y.constraints.minAge||e.age>y.constraints.maxAge)&&l.push({field:"age",msg:`Age must be between ${y.constraints.minAge} and ${y.constraints.maxAge}`}),e.yearlyPremium<y.constraints.minPremium&&l.push({field:"yearlyPremium",msg:`Minimum premium is ₹${x(y.constraints.minPremium)}`});const s=Object.values(e.fundAllocations||{}).reduce((a,n)=>a+n,0);return Math.abs(s-100)>.1&&l.push({field:"funds",msg:`Fund allocation must equal 100% (currently ${s}%)`}),e.pt>30&&l.push({field:"pt",msg:"Max PT is 30 years"}),l}function Ae(e,l,s){if(l>be)return null;const a=l*s,n=e.finalFundValue-a;if(n<=0)return{applicable:!0,totalInvested:a,totalGain:n,taxableGain:0,hypotheticalLtcg:0,savings:0};const t=Math.max(0,n-ge),i=t*ye;return{applicable:!0,totalInvested:a,totalGain:n,taxableGain:t,hypotheticalLtcg:i,savings:i}}function U(e,l){const{age:s,pt:a,ppt:n,yearlyPremium:t,saFactor:i,fundAllocations:c,channel:r}=e,v=t*i,f=Math.pow(1+l,1/12)-1;let p=0;if(y.charges.fmc)for(const[g,E]of Object.entries(c)){const R=y.charges.fmc[g]||.0135;p+=R*(E/100)}else p=.0135;const u=p/12,d={yearlyDetails:[],finalFundValue:0,totalNetPremiums:0,totalCharges:{allocation:0,pac:0,fmc:0,mortality:0}};let m=0,h=s;const b=y.charges.allocation[r]||y.charges.allocation.other,F=b?b.find(g=>g.minPremium<=t)||b[0]:null;for(let g=1;g<=a;g++){let E=g<=n?t:0,R=0,_=0,N=0,re=m;const de=1-(F&&F.ratesByYear?F.ratesByYear[g-1]:1),T=E*de;let V=E-T;d.totalNetPremiums+=V;for(let Y=1;Y<=12;Y++){const ce=(g-1)*12+Y;m+=Y===1?V:0,y.charges.pac&&y.charges.pac[ce.toString()];let te=0;m-=te,R+=te,m=m*(1+f);const ae=m*u;m-=ae,_+=ae;const ue=Math.max(0,v-m);let pe=.001*Math.pow(1.05,Math.max(0,h-20)),ne=ue*pe/12;m-=ne,N+=ne}h++,d.yearlyDetails.push({year:g,age:h-1,premiumPaid:E,allocationCharge:T,fundBeforeFMC:re+V,fmc:_,mortality:N,pac:R,otherCharges:T+R,fundAtEnd:m,deathBenefit:Math.max(v,1.05*(t*Math.min(g,n)),m)}),d.totalCharges.allocation+=T,d.totalCharges.pac+=R,d.totalCharges.fmc+=_,d.totalCharges.mortality+=N}return d.finalFundValue=m,d}function Fe(e){const l=$e(e);if(l.length>0)return{success:!1,errors:l};const{yearlyPremium:s,pt:a,ppt:n,saFactor:t}=e,i=s*t,c=U(e,.04),r=U(e,.08),v=U(e,(e.customReturn||8)/100);let f=0;if(e.addons.adb&&M){const R=`${a}-${n}`;f=(M[R]||M[`${a}-10`]||M[`10-${n}`]||.47)/1e3*i}let p=0;e.addons.ci&&J&&(p=1.5/1e3*i);let u=0;e.addons.carePlus&&Z&&(u=.5/1e3*i);let d=f+p+u,m=s+d,h=0,b=d*.18,F=m+h+b,g=1;e.mode==="Half-Yearly"&&(g=.5),e.mode==="Quarterly"&&(g=.25),e.mode==="Monthly"&&(g=1/12);const E=F*g;return{success:!0,basePremium:s,baseSA:i,riderPremium:d,gst:h+b,totalAnnualWithGST:F,modalPremium:E,breakdown:{adb:f,ci:p,carePlus:u},projections:{scenario4:c,scenario8:r,custom:v}}}function $(e){return e==null||isNaN(e)?"₹0":"₹"+Math.round(e).toLocaleString("en-IN")}function x(e){return e==null||isNaN(e)?"0":Math.round(e).toLocaleString("en-IN")}const xe="/api/fund-details",j=[{key:"1m",label:"1 Month",field:"return1M",bmField:"bmReturn1M",years:1/12,isAbsolute:!0},{key:"3m",label:"3 Months",field:"return3M",bmField:"bmReturn3M",years:.25,isAbsolute:!0},{key:"6m",label:"6 Months",field:"return6M",bmField:"bmReturn6M",years:.5,isAbsolute:!0},{key:"1y",label:"1 Year",field:"return1Y",bmField:"bmReturn1Y",years:1,isAbsolute:!0},{key:"3y",label:"3 Years",field:"return3Y",bmField:"bmReturn3Y",years:3,isAbsolute:!1},{key:"5y",label:"5 Years",field:"return5Y",bmField:"bmReturn5Y",years:5,isAbsolute:!1},{key:"7y",label:"7 Years",field:"return7Y",bmField:"bmReturn7Y",years:7,isAbsolute:!1},{key:"10y",label:"10 Years",field:"return10Y",bmField:"bmReturn10Y",years:10,isAbsolute:!1},{key:"20y",label:"20 Years",field:"return20Y",bmField:"bmReturn20Y",years:20,isAbsolute:!1},{key:"30y",label:"30 Years",field:"return30Y",bmField:"bmReturn30Y",years:30,isAbsolute:!1},{key:"si",label:"Since Inception",field:"returnSI",bmField:"bmReturnSI",years:null,isAbsolute:!1},{key:"custom",label:"Custom Period",field:"returnCustom",bmField:"bmReturnCustom",years:null,isAbsolute:!1}];function Pe(e){return{code:e.stringval1,name:e.stringval2,ulifNumber:e.stringval3,return1M:parseFloat(e.stringval4)||null,return3M:parseFloat(e.stringval5)||null,return6M:parseFloat(e.stringval6)||null,return1Y:parseFloat(e.stringval7)||null,return3Y:parseFloat(e.stringval8)||null,return5Y:parseFloat(e.stringval9)||null,return7Y:parseFloat(e.stringval10)||null,returnSI:parseFloat(e.stringval11)||null,inceptionDate:e.stringval12,starRating:e.stringval13?parseInt(e.stringval13):null,riskLevel:e.stringval14||null,nav:parseFloat(e.stringval15)||null,holdings:e.stringval16,benchmark:e.stringval17,bmReturn1M:parseFloat(e.stringval18)||null,bmReturn3M:parseFloat(e.stringval19)||null,bmReturn6M:parseFloat(e.stringval20)||null,bmReturn1Y:parseFloat(e.stringval21)||null,bmReturn3Y:parseFloat(e.stringval22)||null,bmReturn5Y:parseFloat(e.stringval23)||null,bmReturn7Y:parseFloat(e.stringval24)||null,bmReturnSI:null,bmNav:parseFloat(e.stringval27)||null,navDate:e.stringval28,returnFromDate:e.stringval29,returnCustom:parseFloat(e.stringval30)||null,bmReturnCustom:parseFloat(e.stringval31)||null,category:e.stringval32||"Uncategorized"}}const Re=["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];function D(e){return`${String(e.getDate()).padStart(2,"0")}/${Re[e.getMonth()]}/${e.getFullYear()}`}function W(e){const l=new Date;return l.setFullYear(l.getFullYear()-e),l}async function Ee(e,l){const a=await fetch(xe,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({p_prod_id:307,p_fund_name:"",p_flag:"product_name",p_from_date:e,p_to_date:l})});if(!a.ok)throw new Error(`API returned ${a.status}`);const n=await a.json();if(n.p_error_code!=="success")throw new Error(n.p_message||"API error");return n}async function Ce(){var v,f;const e=D(new Date),l=[{label:"10Y",from:D(W(10)),to:e,field:"return10Y",bmField:"bmReturn10Y"},{label:"20Y",from:D(W(20)),to:e,field:"return20Y",bmField:"bmReturn20Y"},{label:"30Y",from:D(W(30)),to:e,field:"return30Y",bmField:"bmReturn30Y"}],s=await Promise.allSettled(l.map(p=>Ee(p.from,p.to))),a=s.find(p=>p.status==="fulfilled");if(!a){const p=s.map(u=>{var d;return((d=u.reason)==null?void 0:d.message)||"unknown"}).join("; ");throw new Error(`All fund data calls failed: ${p}`)}const n=a.value,t=(n.p_funds_dtls||[]).map(Pe);t.forEach(p=>{p.returnCustom=null,p.bmReturnCustom=null});const i=new Map(t.map(p=>[p.code,p]));s.forEach((p,u)=>{var h;const d=l[u];if(p.status!=="fulfilled"){console.warn(`[fetchFundData] Window ${d.label} failed:`,(h=p.reason)==null?void 0:h.message),i.forEach(b=>{b[d.field]=null,b[d.bmField]=null});return}(p.value.p_funds_dtls||[]).forEach(b=>{const F=b.stringval1,g=i.get(F);if(!g)return;const E=parseFloat(b.stringval30),R=parseFloat(b.stringval31);g[d.field]=isNaN(E)?null:E,g[d.bmField]=isNaN(R)?null:R}),i.forEach(b=>{d.field in b||(b[d.field]=null),d.bmField in b||(b[d.bmField]=null)})});const c=Array.from(i.values()),r={name:((v=n.p_prod_dtls)==null?void 0:v.stringval1)||"Bajaj Allianz Life Goal Assure",tagline:((f=n.p_prod_dtls)==null?void 0:f.stringval2)||""};return{funds:c,product:r}}function ke(e,l,s,a){if(l==null||isNaN(l))return{finalValue:e,gain:0,returnPct:0,available:!1};let n;const t=l/100;if(s.isAbsolute)n=e*(1+t);else{const i=s.key==="si"?a||1:s.years||1;n=e*Math.pow(1+t,i)}return{finalValue:n,gain:n-e,returnPct:l,available:!0}}function se(e,l,s){const a=j.find(f=>f.key===s);if(!a)return null;let n=0,t=!0;const i=[];for(const{fund:f,allocationPct:p}of l){const u=e*(p/100),d=f[a.field];let m=null;if(a.key==="si"&&f.inceptionDate){const b=new Date(f.inceptionDate);m=(new Date-b)/(365.25*24*60*60*1e3)}if(a.key==="custom"&&f.returnFromDate&&f.navDate){const b=F=>{const g=F.split("-");return new Date(`${g[1]} ${g[0]}, ${g[2]}`)};try{const F=b(f.returnFromDate);m=(b(f.navDate)-F)/(365.25*24*60*60*1e3)}catch{m=3}}const h=ke(u,d,a,m);h.available||(t=!1),i.push({fund:f,allocationPct:p,investment:u,...h,benchmarkReturn:f[a.bmField]}),n+=h.finalValue}const c=n-e,r=(n/e-1)*100;let v=null;return!a.isAbsolute&&a.years&&t&&(v=(Math.pow(n/e,1/a.years)-1)*100),{period:a,totalInvestment:e,totalFinalValue:n,totalGain:c,totalReturnPct:r,weightedCAGR:v,allAvailable:t,fundResults:i}}let k=[],O=null,A=[],B=1e6,C="3y",S="All",K=!1,z=null,G=[];async function X(e){e.innerHTML=we();try{K=!0;const l=await Ce();k=l.funds,O=l.product,S="All",K=!1,z=null}catch(l){K=!1,z=l.message}w(e)}function ie(e,l,s){const a=j.find(i=>i.key===s),n=(a==null?void 0:a.field)??"return3Y";return[...l==="All"?e:e.filter(i=>i.category===l)].sort((i,c)=>{const r=i[n],v=c[n];return r==null&&v==null?0:r==null?1:v==null?-1:v-r})}function oe(e,l){return`
        <div class="fp-chip-row" role="group" aria-label="Filter by fund category" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px">
            ${["All",...[...new Set(e.map(n=>n.category))].sort()].map(n=>`
                <button type="button" class="chip fp-cat-chip ${l===n?"on":""}" data-cat="${n}" aria-pressed="${l===n}">${n}</button>
            `).join("")}
        </div>
    `}function we(){return`<div class="fp-loading">
        <div class="sp"></div>
        <div class="lt">Fetching live fund performance data...</div>
    </div>`}function w(e){var n;if(z){e.innerHTML=`
            <div class="fp-error">
                <span class="material-icons-outlined">error_outline</span>
                <h3>Unable to fetch fund data</h3>
                <p>${z}</p>
                <button class="fp-retry-btn" id="fp-retry">Retry</button>
            </div>`,(n=document.getElementById("fp-retry"))==null||n.addEventListener("click",()=>X(e));return}const l={};k.forEach(t=>{l[t.category]||(l[t.category]=[]),l[t.category].push(t)});const s=A.reduce((t,i)=>t+i.allocationPct,0),a=s===100?se(B,A.map(t=>({fund:k.find(i=>i.code===t.fundCode),allocationPct:t.allocationPct})).filter(t=>t.fund),C):null;e.innerHTML=`
        <div class="fp-wrapper">
            <!-- Left: Fund Selection Panel -->
            <aside class="fp-sidebar">
                <div class="profile-hdr">
                    <span class="material-icons-outlined">tune</span>
                    <h2>Investment Setup</h2>
                </div>

                <div class="pf">
                    <div class="fg">
                        <label>Investment Amount</label>
                        <input type="number" id="fp-investment" value="${B}" min="10000" step="10000">
                        <div style="font-size:10px; color:var(--t3); margin-top:2px">${Be(B)}</div>
                    </div>

                    <div class="fg">
                        <label>Return Period</label>
                        <div class="fp-period-grid">
                            ${j.filter(t=>t.key!=="custom").map(t=>`
                                <button class="fp-period-btn ${C===t.key?"active":""}" data-period="${t.key}">${t.label}</button>
                            `).join("")}
                        </div>
                    </div>

                    <div class="sep"></div>

                    <div class="profile-hdr fund-hdr" style="margin-bottom:8px; border-bottom:none; padding-bottom:0">
                        <span class="material-icons-outlined" style="font-size:16px">pie_chart</span>
                        <h2 style="font-size:12px; display:flex; justify-content:space-between; width:100%">
                            Fund Allocation
                            <span id="fp-alloc-total" style="color:${s===100?"var(--bajaj-blue)":"var(--primary)"}">${s}%</span>
                        </h2>
                    </div>

                    <div class="fg" style="margin-bottom:8px">
                        <select id="fp-add-fund" style="font-size:11px; padding:10px; width:100%; cursor:pointer; background:var(--bg)">
                            <option value="">+ Add Fund...</option>
                            ${Object.entries(l).map(([t,i])=>`
                                <optgroup label="${t}">
                                    ${i.map(c=>`<option value="${c.code}" ${A.find(r=>r.fundCode===c.code)?"disabled":""}>${c.name}</option>`).join("")}
                                </optgroup>
                            `).join("")}
                        </select>
                    </div>

                    <div id="fp-fund-sliders">
                        ${Se()}
                    </div>

                    ${s!==100?`<div class="card-err" style="display:block">Total allocation must equal 100% (currently ${s}%)</div>`:""}
                </div>
            </aside>

            <!-- Right: Results Area -->
            <div class="fp-results">
                ${a&&a.allAvailable?Ie(a):Le()}
            </div>
        </div>
    `,Me(e)}function Se(){return A.length===0?`<div style="text-align:center; padding:20px; color:var(--t3); font-size:12px">
            Select funds from the dropdown above to start building your portfolio
        </div>`:A.map(({fundCode:e,allocationPct:l})=>{var a;const s=k.find(n=>n.code===e);return s?`
            <div class="fp-fund-row" data-code="${e}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
                    <div style="flex:1; min-width:0">
                        <div class="fp-fund-name" title="${s.name}">${s.name}</div>
                        <div style="font-size:9px; color:var(--t3)">${s.category} | NAV: ${((a=s.nav)==null?void 0:a.toFixed(2))||"N/A"}</div>
                    </div>
                    <div style="display:flex; gap:8px; align-items:center">
                        <span class="fp-alloc-val">${l}%</span>
                        <span class="material-icons-outlined fp-remove-fund" style="font-size:16px; cursor:pointer; color:var(--t3)">cancel</span>
                    </div>
                </div>
                <input type="range" class="fp-fund-range" data-code="${e}" value="${l}" min="0" max="100" step="5">
            </div>
        `:""}).join("")}function Le(){const e=j.find(s=>s.key===C),l=ie(k,S,C);return`
        <div class="fp-overview-header">
            <h3><span class="material-icons-outlined">assessment</span> All Funds - ${(O==null?void 0:O.name)||"Goal Assure"}</h3>
            <p>Showing <strong>${e==null?void 0:e.label}</strong> performance, sorted highest first${S!=="All"?` · <strong>${S}</strong>`:""}.</p>
        </div>
        ${oe(k,S)}
        <div class="fp-fund-cards">
            ${l.map(s=>{var r;const a=s[e.field],n=e.bmField?s[e.bmField]:null,t=a!=null,i=a>0,c=a!=null&&n!=null&&a>n;return`
                <div class="fp-fund-card ${t?"":"fp-na"}" data-code="${s.code}">
                    <div class="fp-fc-header">
                        <div class="fp-fc-name">${s.name}</div>
                        <div class="fp-fc-category">${s.category}</div>
                    </div>
                    <div class="fp-fc-body">
                        <div class="fp-fc-return ${i?"positive":"negative"}">
                            ${t?`${a>0?"+":""}${a}%`:"N/A"}
                        </div>
                        <div class="fp-fc-label">${e.label} Return${e.isAbsolute?"":" (CAGR)"}</div>
                        ${n!=null?`
                            <div class="fp-fc-benchmark">
                                <span>Benchmark: ${n>0?"+":""}${n}%</span>
                                ${c?'<span class="fp-beat">Outperformed</span>':""}
                            </div>
                        `:""}
                        <div class="fp-fc-meta">
                            <span>NAV: ${((r=s.nav)==null?void 0:r.toFixed(2))||"-"}</span>
                            ${s.riskLevel?`<span class="fp-risk fp-risk-${s.riskLevel.toLowerCase().replace(" ","-")}">${s.riskLevel}</span>`:""}
                        </div>
                    </div>
                    <button class="fp-add-btn" data-code="${s.code}" ${A.find(v=>v.fundCode===s.code)?"disabled":""}>
                        ${A.find(v=>v.fundCode===s.code)?"Added":"+ Add to Portfolio"}
                    </button>
                </div>`}).join("")}
        </div>
    `}function Ie(e){var n;const l=e.period.label,s=!e.period.isAbsolute,a=e.totalGain>=0;return`
        <div class="fp-result-section">
            <!-- Portfolio Summary Card -->
            <div class="fp-summary-card ${a?"profit":"loss"}">
                <div class="fp-summary-header">
                    <div>
                        <span class="material-icons-outlined">account_balance_wallet</span>
                        <span>Portfolio Performance - ${l}</span>
                    </div>
                    <div class="fp-summary-badge">${s?"CAGR":"Absolute"} Return</div>
                </div>

                <div class="fp-summary-body">
                    <div class="fp-summary-main">
                        <div class="fp-summary-stat">
                            <label>Total Invested</label>
                            <div class="fp-stat-value">${$(e.totalInvestment)}</div>
                        </div>
                        <div class="fp-summary-arrow">
                            <span class="material-icons-outlined">${a?"trending_up":"trending_down"}</span>
                        </div>
                        <div class="fp-summary-stat">
                            <label>Current Value</label>
                            <div class="fp-stat-value highlight">${$(e.totalFinalValue)}</div>
                        </div>
                    </div>

                    <div class="fp-summary-metrics">
                        <div class="fp-metric">
                            <label>${a?"Profit":"Loss"}</label>
                            <div class="fp-metric-val ${a?"green":"red"}">${a?"+":""}${$(e.totalGain)}</div>
                        </div>
                        <div class="fp-metric">
                            <label>Total Return</label>
                            <div class="fp-metric-val ${a?"green":"red"}">${a?"+":""}${e.totalReturnPct.toFixed(2)}%</div>
                        </div>
                        ${e.weightedCAGR!==null?`
                        <div class="fp-metric">
                            <label>Weighted CAGR</label>
                            <div class="fp-metric-val ${e.weightedCAGR>=0?"green":"red"}">${e.weightedCAGR>=0?"+":""}${e.weightedCAGR.toFixed(2)}%</div>
                        </div>`:""}
                    </div>
                </div>
            </div>

            <!-- Fund-wise Contribution Cards -->
            <div class="fp-contrib-row">
                ${e.fundResults.map((t,i)=>{const c=["#f37021","#005cb9","#0d9f6e","#d97706","#c41230","#6366f1","#14b8a6","#ec4899"],r=c[i%c.length],v=t.investment>0?t.gain/t.investment*100:0,f=e.totalGain!==0?t.gain/e.totalGain*100:0,p=t.gain>=0;return`
                    <div class="fp-contrib-card" style="border-top:3px solid ${r}">
                        <div class="fp-contrib-name" title="${t.fund.name}">${t.fund.name}</div>
                        <div class="fp-contrib-alloc">${t.allocationPct}% allocation  ·  ${$(t.investment)}</div>
                        <div class="fp-contrib-gain ${p?"green":"red"}">${p?"+":""}${v.toFixed(2)}%</div>
                        <div class="fp-contrib-meta">Gain: <strong class="${p?"green":"red"}">${p?"+":""}${$(t.gain)}</strong></div>
                        <div class="fp-contrib-meta">Share of total gain: <strong>${isFinite(f)?f.toFixed(1):"0.0"}%</strong></div>
                    </div>`}).join("")}
            </div>

            <!-- Fund-wise Breakdown -->
            <div class="fp-breakdown-section">
                <div class="sec-title">
                    <span class="material-icons-outlined">pie_chart</span> Fund-wise Breakdown
                </div>
                <div class="fp-breakdown-table-wrap">
                    <table class="breakdown-table fp-breakdown-table">
                        <thead>
                            <tr>
                                <th>Fund</th>
                                <th>Allocation</th>
                                <th>Invested</th>
                                <th>Return %</th>
                                <th>Final Value</th>
                                <th>Gain / Loss</th>
                                <th>Benchmark</th>
                                <th>Alpha</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${e.fundResults.map(t=>{const i=t.gain,c=t.returnPct!==null&&t.benchmarkReturn!==null?(t.returnPct-t.benchmarkReturn).toFixed(2):null;return`
                                <tr>
                                    <td>
                                        <div class="fp-td-fund">${t.fund.name}</div>
                                        <div class="fp-td-category">${t.fund.category}</div>
                                    </td>
                                    <td class="value-cell">${t.allocationPct}%</td>
                                    <td class="value-cell">${$(t.investment)}</td>
                                    <td class="value-cell ${t.returnPct>=0?"fp-green":"fp-red"}">${t.returnPct!==null?`${t.returnPct>0?"+":""}${t.returnPct}%`:"N/A"}</td>
                                    <td class="value-cell" style="font-weight:700">${$(t.finalValue)}</td>
                                    <td class="value-cell ${i>=0?"fp-green":"fp-red"}">${i>=0?"+":""}${$(i)}</td>
                                    <td class="value-cell">${t.benchmarkReturn!==null?`${t.benchmarkReturn}%`:"-"}</td>
                                    <td class="value-cell ${c>0?"fp-green":c<0?"fp-red":""}">${c!==null?`${c>0?"+":""}${c}%`:"-"}</td>
                                </tr>`}).join("")}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Visual: Allocation Pie + Bar Chart -->
            <div class="fp-charts-row">
                <div class="fp-chart-card">
                    <div class="sec-title"><span class="material-icons-outlined">donut_large</span> Allocation Split</div>
                    <div class="fp-chart-canvas-wrap"><canvas id="fp-pie-chart"></canvas></div>
                </div>
                <div class="fp-chart-card">
                    <div class="sec-title"><span class="material-icons-outlined">bar_chart</span> Invested vs Final Value</div>
                    <div class="fp-chart-canvas-wrap"><canvas id="fp-bar-chart"></canvas></div>
                </div>
            </div>

            <!-- Fund Cards Overview -->
            <div class="fp-overview-header" style="margin-top:24px">
                <h3><span class="material-icons-outlined">assessment</span> All Available Funds</h3>
                <p>Click "Add to Portfolio" to include more funds. Sorted highest ${((n=j.find(t=>t.key===C))==null?void 0:n.label)||""} return first.</p>
            </div>
            ${oe(k,S)}
            <div class="fp-fund-cards compact">
                ${ie(k,S,C).map(t=>{const i=j.find(f=>f.key===C),c=t[i.field],r=c!=null,v=A.find(f=>f.fundCode===t.code);return`
                    <div class="fp-fund-card mini ${v?"added":""}" data-code="${t.code}">
                        <div class="fp-fc-name" style="font-size:11px">${t.name}</div>
                        <div class="fp-fc-return ${c>0?"positive":"negative"}" style="font-size:16px">${r?`${c>0?"+":""}${c}%`:"N/A"}</div>
                        <div class="fp-fc-category">${t.category}</div>
                        <button class="fp-add-btn mini" data-code="${t.code}" ${v?"disabled":""}>
                            ${v?"Added":"+ Add"}
                        </button>
                    </div>`}).join("")}
            </div>
        </div>
    `}function Me(e){const l=document.getElementById("fp-investment");l&&l.addEventListener("input",a=>{B=parseFloat(a.target.value)||0,w(e)}),e.querySelectorAll(".fp-period-btn").forEach(a=>{a.addEventListener("click",()=>{C=a.dataset.period,w(e)})}),e.querySelectorAll(".fp-cat-chip").forEach(a=>{a.addEventListener("click",()=>{S=a.dataset.cat,w(e)})});const s=document.getElementById("fp-add-fund");s&&s.addEventListener("change",a=>{const n=a.target.value;n&&(le(n),w(e))}),e.querySelectorAll(".fp-add-btn").forEach(a=>{a.addEventListener("click",()=>{const n=a.dataset.code;le(n),w(e)})}),e.querySelectorAll(".fp-fund-range").forEach(a=>{a.addEventListener("input",n=>{const t=n.target.dataset.code,i=parseInt(n.target.value),c=A.find(r=>r.fundCode===t);c&&(c.allocationPct=i),w(e)})}),e.querySelectorAll(".fp-remove-fund").forEach(a=>{a.addEventListener("click",n=>{const t=n.target.closest(".fp-fund-row"),i=t==null?void 0:t.dataset.code;i&&(A=A.filter(c=>c.fundCode!==i),w(e))})}),setTimeout(()=>je(),50)}function le(e){if(A.find(a=>a.fundCode===e))return;A.push({fundCode:e,allocationPct:0});const l=Math.floor(100/A.length/5)*5,s=100-l*A.length;A.forEach((a,n)=>{a.allocationPct=l+(n===0?s:0)})}function je(){if(typeof Chart>"u"||(G.forEach(n=>{try{n.destroy()}catch{}}),G=[],A.reduce((n,t)=>n+t.allocationPct,0)!==100))return;const l=se(B,A.map(n=>({fund:k.find(t=>t.code===n.fundCode),allocationPct:n.allocationPct})).filter(n=>n.fund),C);if(!l||!l.allAvailable)return;const s=document.getElementById("fp-pie-chart");if(s){const n=["#f37021","#005cb9","#0d9f6e","#d97706","#c41230","#6366f1","#14b8a6","#ec4899"],t=new Chart(s.getContext("2d"),{type:"doughnut",data:{labels:l.fundResults.map(i=>i.fund.name.length>20?i.fund.name.substring(0,18)+"...":i.fund.name),datasets:[{data:l.fundResults.map(i=>i.allocationPct),backgroundColor:n.slice(0,l.fundResults.length),borderWidth:2,borderColor:"#fff"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom",labels:{font:{size:10},boxWidth:10}}}}});G.push(t)}const a=document.getElementById("fp-bar-chart");if(a){const n=l.fundResults.map(i=>i.fund.name.length>15?i.fund.name.substring(0,13)+"...":i.fund.name),t=new Chart(a.getContext("2d"),{type:"bar",data:{labels:n,datasets:[{label:"Invested",data:l.fundResults.map(i=>i.investment),backgroundColor:"rgba(0, 92, 185, 0.7)"},{label:"Final Value",data:l.fundResults.map(i=>i.finalValue),backgroundColor:"rgba(243, 112, 33, 0.7)"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom",labels:{font:{size:10},boxWidth:10}}},scales:{y:{beginAtZero:!0,ticks:{callback:i=>i>=1e7?(i/1e7).toFixed(1)+" Cr":i>=1e5?(i/1e5).toFixed(1)+" L":i,font:{size:9}}},x:{ticks:{font:{size:9}}}}}});G.push(t)}}function Be(e){return e>=1e7?`${(e/1e7).toFixed(2)} Crore`:e>=1e5?`${(e/1e5).toFixed(2)} Lakhs`:`${x(e)}`}const _e={BASE_URL:"/term-plan-compare/goal-assure-compare/",DEV:!1,MODE:"production",PROD:!0,SSR:!1},Te=typeof import.meta<"u"&&_e&&"/term-plan-compare/goal-assure-compare/"||"./";let L="calculator";const o={age:28,gender:"Male",smoker:"Non Smoker",yearlyPremium:1e6,mode:"Annual",pt:20,ppt:10,saFactor:10,channel:"web",selectedScenario:"custom",customReturn:10,fundAllocations:{},addons:{adb:!1,ci:!1,carePlus:!1}};let P=null,Q=null;function Ye(e){if(Object.keys(o.fundAllocations).length===0&&y.charges.fmc){const r=Object.keys(y.charges.fmc)[0];o.fundAllocations[r]=100}e.innerHTML=`
        <div class="top-nav">
            <div class="nav-brand">
                <div class="nav-logo">B</div>
                <div class="logo-stack">
                    <div class="logo-top">
                        <img src="${Te}Bajaj Logo.png" alt="Bajaj Logo" class="logo-icon" onerror="this.style.display='none'">
                        <span class="logo-life">LIFE GOAL ASSURE IV</span>
                    </div>
                </div>
            </div>
            <div class="nav-tabs">
                <button class="nav-tab ${L==="calculator"?"active":""}" id="tab-calculator">
                    <span class="material-icons-outlined">calculate</span> BI Calculator
                </button>
                <button class="nav-tab ${L==="fundPerformance"?"active":""}" id="tab-fundPerformance">
                    <span class="material-icons-outlined">insights</span> Fund Performance
                </button>
            </div>
        </div>

        <!-- Tab: BI Calculator -->
        <main class="main" id="tab-content-calculator" style="display:${L==="calculator"?"block":"none"}">
            <div class="grid">
                <!-- Profile Panel -->
                <aside class="profile" id="profile-panel">
                    <div class="profile-hdr">
                        <span class="material-icons-outlined">person</span>
                        <h2>Customer Profile</h2>
                    </div>
                    
                    <!-- Scenario Toggle -->
                    <div class="fg" style="margin-bottom: 20px;">
                        <label>Investment Scenario</label>
                        <div class="mode-toggle" style="background: var(--input); border: 1px solid var(--border); margin-top: 4px; flex-wrap: wrap; gap: 4px;">
                            <button class="mode-btn ${o.selectedScenario===4?"active":""}" id="btn-scen-4" style="flex:1; min-width:60px">4%</button>
                            <button class="mode-btn ${o.selectedScenario===8?"active":""}" id="btn-scen-8" style="flex:1; min-width:60px">8%</button>
                            <button class="mode-btn ${o.selectedScenario==="custom"?"active":""}" id="btn-scen-custom" style="flex:1; min-width:60px">Custom</button>
                        </div>
                        
                        <div id="custom-rate-box" style="margin-top:12px; display: ${o.selectedScenario==="custom"?"block":"none"}">
                            <label style="font-size:11px; color:var(--t3)">Custom Growth Rate (%)</label>
                            <div style="display:flex; align-items:center; gap:10px">
                                <input type="range" id="inp-custom-rate" value="${o.customReturn}" min="0" max="50" step="0.5" style="flex:1">
                                <span style="font-weight:700; color:var(--bajaj-orange); min-width:40px">${o.customReturn}%</span>
                            </div>
                        </div>
                    </div>

                    <div class="pf" style="padding-right: 8px;">
                        <div class="fr">
                            <div class="fg">
                                <label>Age</label>
                                <input type="number" id="inp-age" value="${o.age}" min="0" max="65">
                            </div>
                            <div class="fg">
                                <label>Gender</label>
                                <select id="inp-gender">
                                    <option value="Male" ${o.gender==="Male"?"selected":""}>Male</option>
                                    <option value="Female" ${o.gender==="Female"?"selected":""}>Female</option>
                                </select>
                            </div>
                        </div>

                        <div class="fg">
                            <label>Annual Premium (₹)</label>
                            <input type="number" id="inp-premium" value="${o.yearlyPremium}" min="25000" step="5000">
                        </div>

                        <div class="fg">
                            <label>SA Multiple</label>
                            <input type="number" id="inp-sa-factor" value="${o.saFactor}" min="7" max="25">
                            <div style="font-size: 10px; color: var(--t3); margin-top: 4px;">Total Cover: <span id="disp-sum-assured" style="font-weight:700;color:var(--t1)">₹${x(o.yearlyPremium*o.saFactor)}</span></div>
                        </div>

                        <div class="fr">
                            <div class="fg">
                                <label>Policy Term</label>
                                <input type="number" id="inp-pt" value="${o.pt}" min="5" max="30">
                            </div>
                            <div class="fg">
                                <label>Pay Term</label>
                                <input type="number" id="inp-ppt" value="${o.ppt}" min="5" max="30">
                            </div>
                        </div>

                        <div class="fg">
                            <label>Mode</label>
                            <select id="inp-mode">
                                <option value="Annual" ${o.mode==="Annual"?"selected":""}>Annual</option>
                                <option value="Half-Yearly" ${o.mode==="Half-Yearly"?"selected":""}>Half-Yearly</option>
                                <option value="Quarterly" ${o.mode==="Quarterly"?"selected":""}>Quarterly</option>
                                <option value="Monthly" ${o.mode==="Monthly"?"selected":""}>Monthly</option>
                            </select>
                        </div>
                        
                        <div class="sep"></div>
                        <div class="profile-hdr fund-hdr" style="margin-bottom:8px; border-bottom:none; padding-bottom:0">
                            <span class="material-icons-outlined" style="font-size:16px">pie_chart</span>
                            <h2 style="font-size:12px; display:flex; justify-content:space-between; width:100%">
                                Fund Allocation 
                                <span id="alloc-total" style="color:var(--bajaj-blue)">100%</span>
                            </h2>
                        </div>

                        <div class="fg" style="margin-bottom: 20px;">
                            <select id="inp-add-fund" style="font-size:11px; padding:10px; width:100%; cursor:pointer; background:var(--bg)">
                                <option value="">+ Add / Change Fund...</option>
                                ${Object.keys(y.charges.fmc).map(r=>`<option value="${r}">${r}</option>`).join("")}
                            </select>
                        </div>
                        
                        <div id="fund-sliders-container">
                            ${ee()}
                        </div>
                        <div class="card-err" id="fund-err">Total allocation must be 100%</div>
                    </div>
                </aside>

                <!-- Content Area -->
                <div class="cards-area">
                    <div id="dashboard-container"></div>
                    <div id="ltcg-benefit-slot"></div>

                    <div class="section">
                        <div class="sec-title" style="justify-content:space-between">
                            <span><span class="material-icons-outlined" style="vertical-align:middle">table_view</span> Benefit Illustration</span>
                            <span style="font-size:11px; color:var(--bajaj-orange); font-weight:700">Scenario: <span id="disp-scen-label"></span></span>
                        </div>
                        <div style="overflow-x:auto">
                            <table class="breakdown-table" id="bi-table" style="font-size:12px">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Premium</th>
                                        <th>Mortality</th>
                                        <th>Charges</th>
                                        <th>GST</th>
                                        <th>Fund Value (EOY)</th>
                                        <th>Surrender</th>
                                        <th>Death Benefit</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="section" id="riders-section">
                        <div class="sec-title">
                            <span class="material-icons-outlined">extension</span> Options & Riders
                        </div>
                        <div class="addons-grid">
                            <div class="addon" id="addon-adb">
                                <div>
                                    <h4>Accidental Death</h4>
                                    <div class="addon-price" id="price-adb">+ ₹0</div>
                                </div>
                                <div class="tog" id="tog-adb"></div>
                            </div>
                            <div class="addon" id="addon-ci">
                                <div>
                                    <h4>Critical Illness</h4>
                                    <div class="addon-price" id="price-ci">+ ₹0</div>
                                </div>
                                <div class="tog" id="tog-ci"></div>
                            </div>
                            <div class="addon" id="addon-care">
                                <div>
                                    <h4>Care Plus Rider</h4>
                                    <div class="addon-price" id="price-care">+ ₹0</div>
                                </div>
                                <div class="tog" id="tog-care"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Tab: Fund Performance -->
        <main class="main" id="tab-content-fundPerformance" style="display:${L==="fundPerformance"?"block":"none"}">
            <div id="fund-performance-root"></div>
        </main>

        <div class="bottom" id="bottom-bar" style="display:${L==="calculator"?"flex":"none"}">
            <div class="bot-info" style="gap: 40px; margin-left: 310px;">
                <div class="bot-item">
                    <span class="bot-lbl">Base Premium</span>
                    <span class="bot-val" id="ftr-base-prem" style="color: #cbd5e1; font-size:14px">₹0</span>
                </div>
                <div class="bot-item">
                    <span class="bot-lbl">Riders</span>
                    <span class="bot-val" id="ftr-riders" style="color: #cbd5e1; font-size:14px">₹0</span>
                </div>
                <div class="bot-item">
                    <span class="bot-lbl">Mode</span>
                    <span class="bot-val" id="ftr-mode" style="color: #cbd5e1; font-size:14px">Annual</span>
                </div>
                <div class="bot-item" style="padding-left: 20px; border-left: 1px solid rgba(255,255,255,0.2);">
                    <span class="bot-lbl">Total Installment Premium</span>
                    <span class="bot-val hl" id="ftr-total-prem" style="font-size:24px">₹0</span>
                </div>
            </div>
        </div>
    `,De(),I();const l=document.getElementById("tab-calculator"),s=document.getElementById("tab-fundPerformance"),a=document.getElementById("tab-content-calculator"),n=document.getElementById("tab-content-fundPerformance"),t=document.getElementById("bottom-bar");let i=!1;const c=r=>{L=r,l.classList.toggle("active",r==="calculator"),s.classList.toggle("active",r==="fundPerformance"),a.style.display=r==="calculator"?"block":"none",n.style.display=r==="fundPerformance"?"block":"none",t.style.display=r==="calculator"?"flex":"none",r==="fundPerformance"&&!i&&(i=!0,X(document.getElementById("fund-performance-root")))};l.addEventListener("click",()=>c("calculator")),s.addEventListener("click",()=>c("fundPerformance")),L==="fundPerformance"&&(i=!0,X(document.getElementById("fund-performance-root")))}function ee(){return Object.entries(o.fundAllocations).map(([e,l])=>`
        <div class="fg fund-row active-fund" style="margin-bottom:16px; position:relative" data-fund="${e}">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--t1); margin-bottom:6px; align-items:center">
                <span class="fund-name-lbl" title="${e}" style="font-weight:700; color:var(--bajaj-blue)">${e.length>30?e.substring(0,27)+"...":e}</span>
                <div style="display:flex; gap:10px; align-items:center">
                    <span class="alloc-val" style="font-weight:800; color:var(--bajaj-orange); background:rgba(243,112,33,0.1); padding:2px 6px; border-radius:4px">${l}%</span>
                    <span class="material-icons-outlined btn-remove-fund" style="font-size:16px; cursor:pointer; color:var(--t3); hover:color:var(--bajaj-orange)">cancel</span>
                </div>
            </div>
            <input type="range" class="fund-range" data-fund="${e}" value="${l}" min="0" max="100" style="width:100%; height:4px">
        </div>
    `).join("")}function De(){const e=(u,d,m=!1)=>{const h=document.getElementById(u);h&&h.addEventListener("input",b=>{o[d]=m?parseFloat(b.target.value)||0:b.target.value,I()})};e("inp-age","age",!0),e("inp-gender","gender"),e("inp-premium","yearlyPremium",!0),e("inp-sa-factor","saFactor",!0),e("inp-pt","pt",!0),e("inp-ppt","ppt",!0),e("inp-mode","mode");const l=document.getElementById("btn-scen-4"),s=document.getElementById("btn-scen-8"),a=document.getElementById("btn-scen-custom"),n=document.getElementById("custom-rate-box"),t=document.getElementById("inp-custom-rate"),i=u=>{o.selectedScenario=u,[l,s,a].forEach(d=>{const m=d.id==="btn-scen-"+(u==="custom"?"custom":u);d.classList.toggle("active",m),d.style.background=m?"var(--bajaj-orange)":"var(--input)",d.style.color=m?"white":"var(--t2)"}),n.style.display=u==="custom"?"block":"none",I()};l.addEventListener("click",()=>i(4)),s.addEventListener("click",()=>i(8)),a.addEventListener("click",()=>i("custom")),t.addEventListener("input",u=>{o.customReturn=parseFloat(u.target.value),u.target.nextElementSibling.innerText=o.customReturn+"%",I()});const c=document.getElementById("fund-sliders-container"),r=document.getElementById("inp-add-fund"),v=()=>{c.querySelectorAll(".fund-range").forEach(u=>{u.oninput=d=>{const m=d.target.dataset.fund,h=parseInt(d.target.value);o.fundAllocations[m]=h,d.target.parentElement.querySelector(".alloc-val").innerText=h+"%",I()}}),c.querySelectorAll(".btn-remove-fund").forEach(u=>{u.onclick=d=>{const m=d.target.closest(".fund-row").dataset.fund;delete o.fundAllocations[m],c.innerHTML=ee(),v(),I()}})};r.onchange=u=>{const d=u.target.value;d&&(d in o.fundAllocations||(o.fundAllocations[d]=0,c.innerHTML=ee(),v()),u.target.value="")},v();const f=(u,d)=>{const m=document.getElementById(`addon-${u}`);document.getElementById(`tog-${u}`),m.addEventListener("click",()=>{o.addons[d]=!o.addons[d],p(u,o.addons[d]),I()})},p=(u,d)=>{const m=document.getElementById(`addon-${u}`),h=document.getElementById(`tog-${u}`);m.classList.toggle("on",d),h.classList.toggle("on",d)};f("adb","adb"),f("ci","ci"),f("care","carePlus")}function I(){const e=Object.values(o.fundAllocations).reduce((n,t)=>n+t,0),l=document.getElementById("alloc-total"),s=document.getElementById("fund-err");if(l&&(l.innerText=e+"%",l.style.color=e===100?"var(--bajaj-blue)":"var(--bajaj-orange)"),e!==100){s&&(s.style.display="block");return}s&&(s.style.display="none"),document.getElementById("disp-sum-assured").innerText=$(o.yearlyPremium*o.saFactor);let a=0;Object.keys(o.fundAllocations).forEach(n=>{a+=o.fundAllocations[n]/100*(y.charges.fmc[n]||.0135)}),P=Fe({...o}),P.success&&(Ge(),ze(),Ne(),Ve(),setTimeout(He,0))}function Ge(){const e=document.getElementById("dashboard-container"),l=o.selectedScenario==="custom"?"custom":"scenario"+o.selectedScenario,s=P.projections[l],a=o.selectedScenario==="custom"?o.customReturn:o.selectedScenario;document.getElementById("disp-scen-label").innerText=a+"% p.a.",e.innerHTML=`
        <div class="card best dashboard-card">
            <div class="dashboard-header">
                <div class="header-left">
                    <span class="material-icons-outlined">insights</span>
                    <span>Investment Performance Dashboard</span>
                </div>
                <div class="badge">${a}% Growth Scenario</div>
            </div>
            
            <div class="dashboard-body">
                <div class="summary-stats">
                    <div class="main-stat">
                        <label>Maturity Fund Value (Year ${o.pt})</label>
                        <div class="value highlight">${x(s.finalFundValue)}</div>
                        <span class="subtext">At age ${o.age+o.pt}</span>
                    </div>
                    
                    <div class="stat-grid">
                        <div class="stat-item">
                            <label>Total Invested</label>
                            <div class="val">${x(o.yearlyPremium*Math.min(o.pt,o.ppt))}</div>
                        </div>
                        <div class="stat-item">
                            <label>Net Wealth Gain</label>
                            <div class="val blue">${x(s.finalFundValue-o.yearlyPremium*Math.min(o.pt,o.ppt))}</div>
                        </div>
                        <div class="stat-item">
                            <label>Death Benefit (Y1)</label>
                            <div class="val">${x(s.yearlyDetails[0].deathBenefit)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <div class="chart-header">
                        Wealth Growth Projection
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="maturity-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `}function Oe(e,l){if(e===null)return"";const s=`
        <div class="ltcg-head">
            <span class="material-icons-outlined">savings</span>
            <h3>Tax Benefit — LTCG Savings</h3>
            <span class="ltcg-badge">Exempt u/s 10(10D)</span>
        </div>`;return e.savings===0?`
        <section class="ltcg-benefit">
            ${s}
            <div class="ltcg-zero">
                Maturity gain falls within the ₹1.25L LTCG exemption — no tax would
                apply even under equity mutual-fund taxation.
            </div>
        </section>`:`
        <section class="ltcg-benefit">
            ${s}
            <div class="ltcg-grid">
                <div class="ltcg-stat">
                    <label>Total Invested</label>
                    <div class="ltcg-val">${$(e.totalInvested)}</div>
                </div>
                <div class="ltcg-stat">
                    <label>Maturity Gain</label>
                    <div class="ltcg-val">${$(e.totalGain)}</div>
                </div>
                <div class="ltcg-stat">
                    <label>LTCG if taxed as Equity MF</label>
                    <div class="ltcg-val red">${$(e.hypotheticalLtcg)}</div>
                    <div class="ltcg-sub">12.5% on ${$(e.taxableGain)} (above ₹1.25L exemption)</div>
                </div>
                <div class="ltcg-stat highlight">
                    <label>You Save</label>
                    <div class="ltcg-val green">${$(e.savings)}</div>
                    <div class="ltcg-sub">vs equivalent equity MF gain</div>
                </div>
            </div>
            <div class="ltcg-fine">
                Applicable because annual premium (${$(l)}) is within the
                ₹2.5L limit. ULIP proceeds are tax-free under Section 10(10D). The comparison applies
                the current LTCG rate (12.5% on gains above ₹1.25L) to this ULIP's own gain as an
                equivalent mutual-fund tax liability.
            </div>
        </section>`}function ze(){const e=document.getElementById("ltcg-benefit-slot");if(!e)return;const l=o.selectedScenario==="custom"?"custom":"scenario"+o.selectedScenario,s=P.projections[l],a=Math.min(o.pt,o.ppt),n=Ae(s,o.yearlyPremium,a);e.innerHTML=Oe(n,o.yearlyPremium)}function Ne(){const e=document.querySelector("#bi-table tbody"),l=o.selectedScenario==="custom"?"custom":"scenario"+o.selectedScenario,s=P.projections[l].yearlyDetails;e.innerHTML=s.map(a=>`
        <tr>
            <td>Year ${a.year}</td>
            <td class="value-cell">${x(a.premiumPaid)}</td>
            <td class="value-cell">${x(a.mortality)}</td>
            <td class="value-cell">${x(a.otherCharges)}</td>
            <td class="value-cell">0</td> 
            <td class="value-cell" style="font-weight:700; color:var(--bajaj-blue)">${x(a.fundAtEnd)}</td>
            <td class="value-cell">${x(a.fundAtEnd)}</td>
            <td class="value-cell">${x(a.deathBenefit)}</td>
        </tr>
    `).join("")}function Ve(){document.getElementById("ftr-base-prem").innerText=$(P.basePremium),document.getElementById("ftr-riders").innerText=$(P.riderPremium),document.getElementById("ftr-mode").innerText=o.mode,document.getElementById("ftr-total-prem").innerText=$(P.modalPremium);const e=(l,s)=>{const a=document.getElementById(l);a&&(a.innerText="+ "+$(s))};e("price-adb",P.breakdown.adb),e("price-ci",P.breakdown.ci),e("price-care",P.breakdown.carePlus)}function He(){const e=document.getElementById("maturity-chart");if(!e)return;const l=e.getContext("2d"),s=o.selectedScenario==="custom"?"custom":"scenario"+o.selectedScenario,a=P.projections[s].yearlyDetails,n=a.map(r=>""+r.year),t=a.map(r=>r.fundAtEnd),i=[];let c=0;a.forEach(r=>{c+=r.premiumPaid,i.push(c)}),Q&&Q.destroy(),Q=new Chart(l,{type:"line",data:{labels:n,datasets:[{label:"Fund Value",data:t,borderColor:"#f37021",backgroundColor:"rgba(243, 112, 33, 0.05)",fill:!0,tension:.4,borderWidth:3,pointRadius:0,pointHoverRadius:6,pointHoverBackgroundColor:"#f37021"},{label:"Total Paid",data:i,borderColor:"#0b3a6e",borderDash:[5,5],fill:!1,tension:0,borderWidth:1.5,pointRadius:0}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{intersect:!1,mode:"index"},plugins:{legend:{display:!0,position:"bottom",labels:{boxWidth:8,font:{size:10,weight:"600"}}},tooltip:{backgroundColor:"rgba(11, 58, 110, 0.95)",titleFont:{size:12},padding:12}},scales:{y:{beginAtZero:!0,ticks:{callback:r=>r>=1e7?(r/1e7).toFixed(1)+" Cr":r>=1e5?(r/1e5).toFixed(1)+" L":r,font:{size:9}},grid:{color:"rgba(226, 232, 240, 0.5)"}},x:{ticks:{font:{size:9}},grid:{display:!1}}}}})}async function qe(e){const l=document.getElementById(e);if(l){l.innerHTML='<div class="ld"><div class="sp"></div><div class="lt">Initializing Dashboard...</div></div>';try{await fe(),await he(),setTimeout(()=>Ye(l),300)}catch(s){l.innerHTML=`<div>Error: ${s}</div>`}}}qe("app");
