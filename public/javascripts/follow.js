function follow(){
	$.ajax({
        method: 'POST',
        url: '/api/v1/follow',
        data: {
        	"_id":_id
         	 }
    })
    .done(function(data){
      if(following == "false") {
      show_notification('Following user!','success')
      setTimeout(()=> {window.location.reload()}, 1000)

    } else {
      show_notification('Unfollowed user!','success')
      setTimeout(()=> {window.location.reload()}, 1000)
    }})
    .fail(function(data){
      console.log(data)  
    });
};