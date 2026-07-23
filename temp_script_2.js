
    /* PRODUCTION HARDENING */
    window.onerror = function(m,u,l){ console.error('Error:',m,u,l); return false; };
    window.addEventListener('unhandledrejection',function(e){ console.error('Unhandled:',e.reason); });
    function updateOnlineStatus(){
      var b=document.getElementById('offline-banner');if(!b)return;
      if(!navigator.onLine){b.classList.add('show');}
      else{b.classList.remove('show');if(typeof _sbPending!=='undefined'&&_sbPending&&typeof pushCloudDB==='function')pushCloudDB();}
    }
    window.addEventListener('online',updateOnlineStatus);
    window.addEventListener('offline',updateOnlineStatus);
    updateOnlineStatus();
    function resetIdleTimer(){
      if(typeof _idleTimer!=='undefined')clearTimeout(_idleTimer);
      if(typeof curUser==='undefined'||!curUser)return;
      _idleTimer=setTimeout(function(){
        if(typeof curUser!=='undefined'&&curUser&&typeof logout==='function'){
          logout();if(typeof showToast==='function')showToast('Session expired. Please sign in again.','tw2',5000);
        }
      },typeof IDLE_TIMEOUT!=='undefined'?IDLE_TIMEOUT:1800000);
    }
    ['mousemove','keydown','click','scroll','touchstart'].forEach(function(e){document.addEventListener(e,resetIdleTimer,{passive:true});});
    window.addEventListener('beforeunload',function(e){if(typeof _sbPending!=='undefined'&&_sbPending){e.preventDefault();e.returnValue='Sync in progress.';}});
    window.addEventListener('load',function(){
      var l=document.getElementById('app-loader');
      if(l){setTimeout(function(){l.classList.add('hidden');setTimeout(function(){l.remove();},500);},600);}
    });

