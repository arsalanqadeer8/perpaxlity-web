
  for(let i=0; i<sessionStorage.length; i++){
    if(sessionStorage.key(i).startsWith('sb-') && sessionStorage.key(i).endsWith('-auth-token')){
      document.write('<style>#landing-page { display: none !important; }</style>');
      break;
    }
  }
