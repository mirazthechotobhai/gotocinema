"use strict";var ReplitPill=(()=>{(function(){if(typeof window>"u"||typeof document>"u")return;let w=window.self!==window.top;if(w&&document.referrer.startsWith("https://replit-com.web-sandbox.oaiusercontent.com"))return;let v=(()=>{let c=window.location.origin;return!!(c.endsWith(".replit.dev")||c.endsWith(".repl.co"))})(),a=!0,M=document.currentScript?.getAttribute("data-referral-code"),S=()=>{try{let c=!1;try{c=window.localStorage?.getItem("replit-pill-preference")==="hidden"}catch{}if(c||document.getElementById("replit-pill-host"))return;let E=document.createElement("div");E.id="replit-pill-host";let R=E.attachShadow({mode:"closed"}),_=`
        <path d="M25 19.995C25 20.0375 25 20.0575 25 20.085C25.015 21.34 25.5475 22.6275 26.425 23.525C26.445 23.545 26.4475 23.5475 26.45 23.55C26.485 23.585 26.5025 23.6025 26.54 23.6375C27.4225 24.485 28.6775 25.005 29.9025 25.03C29.9525 25.03 29.9975 25.03 30.0825 25.03H42C44.8 25.03 46.2 25.03 47.27 25.575C48.21 26.055 48.975 26.82 49.455 27.76C50 28.83 50 30.23 50 33.03V42.03C50 44.83 50 46.23 49.455 47.3C48.975 48.24 48.21 49.005 47.27 49.485C46.2 50.03 44.8 50.03 42 50.03H29.9275C28.6425 50.0325 27.3225 50.58 26.4125 51.485C26.4075 51.49 26.4775 51.42 26.45 51.4475C26.445 51.4525 26.4425 51.4525 26.4225 51.475C25.545 52.3725 25.0125 53.6575 24.9975 54.9125C24.9975 54.94 24.9975 54.9625 24.9975 55.0025V67.0575C24.9975 69.8575 24.9975 71.2575 24.4525 72.3275C23.9725 73.2675 23.2075 74.0325 22.2675 74.5125C21.1975 75.0575 19.7975 75.0575 16.9975 75.0575H7.9975C5.1975 75.0575 3.7975 75.0575 2.7275 74.5125C1.7875 74.0325 1.0225 73.2675 0.542498 72.3275C-0.00250244 71.2575 -0.00250244 69.8575 -0.00250244 67.0575V58.0575C-0.00250244 55.2575 -0.00250244 53.8575 0.542498 52.7875C1.0225 51.8475 1.7875 51.0825 2.7275 50.6025C3.7975 50.0575 5.1975 50.0575 7.9975 50.0575H19.7225C19.9 50.0575 19.9875 50.0575 20.08 50.055C21.2475 50.0125 22.4375 49.52 23.295 48.7225C23.3625 48.66 23.4125 48.61 23.5125 48.51C23.55 48.4725 23.5675 48.455 23.6025 48.42C24.455 47.5325 24.9725 46.2825 24.9975 45.0525C24.9975 45.0025 24.9975 44.96 24.9975 44.875V30.12C24.9975 30.0325 24.9975 29.99 24.9975 29.94C24.9725 28.71 24.455 27.46 23.6025 26.575C23.5675 26.54 23.55 26.52 23.5125 26.4825C23.475 26.445 23.4575 26.4275 23.42 26.3925C22.5325 25.54 21.2825 25.0225 20.0525 24.9975C20.0025 24.9975 19.96 24.9975 19.875 24.9975H7.9975C5.1975 24.9975 3.7975 24.9975 2.7275 24.4525C1.7875 23.9725 1.0225 23.2075 0.542498 22.2675C-0.00250244 21.1975 -0.00250244 19.7975 -0.00250244 16.9975V7.9975C-2.44146e-06 5.2 -2.44379e-06 3.8 0.544998 2.73C1.025 1.79 1.79 1.025 2.73 0.545C3.8 0 5.2 0 8 0H17C19.8 0 21.2 0 22.27 0.545C23.21 1.025 23.975 1.79 24.455 2.73C25 3.8 25 5.2 25 8V19.995Z" fill="currentColor"/>
      `,T=`
        <path d="M18 6 6 18"></path>
        <path d="m6 6 12 12"></path>
      `,W=document.createElement("style");W.textContent=`
        #replit-pill {
          position: fixed;
          bottom: 32px;
          right: 32px;
          border-radius: 120px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          z-index: 1000000;
          white-space: nowrap;
          cursor: pointer;
          overflow: hidden;
          color: #f0f2f6;
          background-image:
            linear-gradient(
              180deg,
              rgba(46, 50, 60, 0.34) 0%,
              rgba(14, 16, 22, 0.5) 100%
            );
          background-color: rgba(17, 19, 25, 0.46);
          backdrop-filter: blur(22px) saturate(180%) contrast(105%);
          -webkit-backdrop-filter: blur(22px) saturate(180%) contrast(105%);
          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.26),
            0 1px 2px rgba(0, 0, 0, 0.18),
            inset 0 0 0 1px rgba(255, 255, 255, 0.16),
            inset 0 1px 1px rgba(255, 255, 255, 0.22);
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.22);
          transition: transform 0.2s ease;
        }
        #replit-pill:hover {
          transform: scale(1.05);
        }
        #replit-pill .shimmer {
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          transition: transform 0.7s ease-in-out;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.18), transparent);
          pointer-events: none;
        }
        #replit-pill:hover .shimmer {
          transform: translateX(100%);
        }
        #replit-pill .badge-content {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          position: relative;
          flex: 0 0 auto;
        }
        #replit-pill .replit-logo {
          color: currentColor;
        }
        #replit-pill .flip {
          position: relative;
          display: inline-block;
          height: 20px;
          overflow: hidden;
          font-weight: 500;
          line-height: 20px;
          color: currentColor;
        }
        #replit-pill .flip.ready {
          transition: width 560ms cubic-bezier(0.32, 0.72, 0, 1);
        }
        #replit-pill .row {
          position: absolute;
          inset: 0 auto 0 0;
          display: flex;
          align-items: center;
          white-space: nowrap;
          transform: translateY(-100%);
          opacity: 0;
          line-height: 1;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        #replit-pill .row.in {
          will-change: transform, opacity, filter;
          animation: replit-pill-roll-in 560ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        #replit-pill .row.out {
          will-change: transform, opacity, filter;
          animation: replit-pill-roll-out 560ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        @keyframes replit-pill-roll-in {
          0%   { transform: translateY(70%);  opacity: 0; filter: blur(1.5px); }
          60%  { opacity: 1; filter: blur(0); }
          100% { transform: translateY(0);    opacity: 1; filter: blur(0); }
        }
        @keyframes replit-pill-roll-out {
          0%   { transform: translateY(0);    opacity: 1; filter: blur(0); }
          100% { transform: translateY(-70%); opacity: 0; filter: blur(1.5px); }
        }
        #replit-pill .close-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          flex: 0 0 auto;
          border-radius: 64px;
          width: 22px;
          height: 22px;
          margin: -5px -6px -5px -6px;
          min-width: 0;
          cursor: pointer;
          border: none;
          box-sizing: border-box;
          background-color: transparent;
        }
        /* Visible hover circle is smaller than the 22px click target. */
        #replit-pill .close-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 16px;
          height: 16px;
          transform: translate(-50%, -50%);
          border-radius: 64px;
          background-color: transparent;
          transition: background-color 0.2s ease;
          pointer-events: none;
        }
        #replit-pill .close-button:hover::before {
          background-color: rgba(255, 255, 255, 0.14);
        }
        #replit-pill .close-button:focus-visible::before {
          background-color: rgba(255, 255, 255, 0.1);
          outline: 1px solid #e6e9ef;
          outline-offset: 1px;
        }
        #replit-pill .close-icon {
          position: relative;
          width: 8px;
          height: 8px;
          color: #e6e9ef;
        }
        @media (width <= 480px) {
          #replit-pill {
            right: 24px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          #replit-pill,
          #replit-pill .flip,
          #replit-pill .row,
          #replit-pill .shimmer {
            transition: none;
          }
          #replit-pill .row.in,
          #replit-pill .row.out {
            animation: none;
          }
        }
      `;let I=(n,i,t,f,s)=>{let e=document.createElementNS("http://www.w3.org/2000/svg","svg");return e.setAttribute("width",n),e.setAttribute("height",i),e.setAttribute("viewBox",t),e.setAttribute("fill","none"),s&&(e.className.baseVal=s),e.innerHTML=f,e},r=document.createElement("div");r.id="replit-pill",r.setAttribute("data-state","brand");let H=document.createElement("div");H.className="shimmer";let k=document.createElement("div");k.className="badge-content";let B=I("9.33","14","0 0 50 75",_,"replit-logo"),p=document.createElement("span");p.className="flip";let o=document.createElement("span");o.className="row",o.setAttribute("data-key","brand"),o.setAttribute("aria-hidden","false"),o.textContent="Made with Replit";let l=document.createElement("span");l.className="row",l.setAttribute("data-key","cta"),l.setAttribute("aria-hidden","true"),l.textContent="Build for free",p.append(o,l);let d=document.createElement("button");d.className="close-button",d.setAttribute("aria-label","Close");let m=I("24","24","0 0 24 24",T,"close-icon");m.setAttribute("stroke","currentColor"),m.setAttribute("stroke-width","2"),m.setAttribute("stroke-linecap","round"),m.setAttribute("stroke-linejoin","round"),d.appendChild(m),k.append(B,p),r.append(H,k,d);let C,b=()=>{C!==void 0&&(window.clearTimeout(C),C=void 0)};r.onclick=n=>{if(n.target!==d&&n.target!==d.firstChild){let i=M?`https://replit.com/referral-code/${M}?source=badge&referrer=${encodeURIComponent(window.location.origin)}`:"https://join.replit.com/badge_v3";if(w&&v&&window.parent){let t={type:"CLICKED_MADE_WITH_REPLIT_BADGE"};window.parent.postMessage(t,"*")}else window.open(i,"_blank")}},d.onclick=n=>{n.stopPropagation(),r.style.display="none",a=!1,b();try{window.localStorage.setItem("replit-pill-preference","hidden")}catch{}},R.appendChild(W),R.appendChild(r),document.body.appendChild(E);let V=!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!(w&&v),D=6400,N=560,x={brand:0,cta:0},g="brand",h=!1,A=!1,L=!1,y=()=>A||L,u=()=>{},z=()=>{let n=g==="brand"?"cta":"brand",i=g==="brand"?o:l,t=g==="brand"?l:o;p.style.width=`${x[n]}px`,i.style.transform="",i.style.opacity="",i.classList.remove("in"),i.classList.add("out"),i.setAttribute("aria-hidden","true"),t.classList.remove("out"),t.offsetWidth,t.classList.add("in"),t.setAttribute("aria-hidden","false"),r.setAttribute("data-state",n),g=n,h=!0;let f=!1,s=0,e=()=>{f||(f=!0,window.clearTimeout(s),t.removeEventListener("animationend",e),i.classList.remove("out"),h=!1,a&&!y()&&u())};t.addEventListener("animationend",e),s=window.setTimeout(e,N+80)};u=()=>{!V||!a||y()||h||(b(),C=window.setTimeout(z,D))},(()=>{x.brand=o.scrollWidth,x.cta=l.scrollWidth,p.style.width=`${x[g]}px`,o.style.transform="translateY(0)",o.style.opacity="1",requestAnimationFrame(()=>{p.classList.add("ready"),u()})})(),r.addEventListener("mouseenter",()=>{A=!0,b()}),r.addEventListener("mouseleave",()=>{A=!1,!y()&&!h&&u()}),r.addEventListener("focusin",()=>{L=!0,b()}),r.addEventListener("focusout",()=>{L=!1,!y()&&!h&&u()}),w&&v?window.addEventListener("message",n=>{let i=n.origin,t=new URL(i),f=t.hostname==="replit.com"||t.hostname.endsWith(".replit.com")||t.hostname.endsWith(".replit.dev")||t.hostname.endsWith(".repl.co"),s=!1;if(document.referrer)try{let P=new URL(document.referrer).origin;s=i===P}catch{}if(!f&&!s)return;let e=n.data;if(!(!e||typeof e!="object"||!e.type)){if(e.type==="SHOW_MADE_WITH_REPLIT_BADGE"){if(a)return;r.style.display="inline-flex",a=!0,u()}else if(e.type==="HIDE_MADE_WITH_REPLIT_BADGE"){if(!a)return;r.style.display="none",a=!1,b()}}}):a=!0}catch{}};document.readyState==="complete"||document.readyState==="interactive"?setTimeout(S,100):document.addEventListener("DOMContentLoaded",S)})();})();
