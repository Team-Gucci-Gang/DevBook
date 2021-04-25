// <% for(var post of postList) { %>
//     <div class="gram-card">
//       <div class="gram-card-header">
//         <img src="<%= post.author.profile_picture %>" class="gram-card-user-image lozad">
//         <a class="gram-card-user-name" href="/u/@<%= post.author.username %>"><%= post.author.username %></a>
  
//               <div class="dropdown gram-card-time">
//                 <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"> <i class="glyphicon glyphicon-option-vertical"></i></a>
//                 <ul class="dropdown-menu dropdown-menu-right">
//                   <li><a href="<%= post.post.static_url %>"><i class="fa fa-share"></i> View</a></li>
//                   <% if(post.author.username == user.username) { %>
//                     <li><a href="/me/post/<%= post.post._id %>"><i class="fa fa-cog"></i> Edit</a></li>
//                     <li><a href="/me/post/delete/<%= post.post._id %>"><i class="fa fa-trash"></i> Delete</a></li>
//                   <% } %>
//                 </ul>
//                 </div>
//                 <div class="time"><%= post.post.timeago %></div>
//       </div>
//       <br>
//       <br>
//       <div class="gram-card-image">
//         <% if (post.post.code ) { %>
//           <pre style="margin:5px;"><code class="language-<%= post.post.lang %>"><%= post.post.code %></code></pre>
//         <% } %>
//         <% if(post.post.static_url) { %>
//         <center>
//         <% if(['png','jpeg','jpg','gif','svg'].indexOf(post.post.type) >= 0) { %>
//           <a href="<%= post.post.static_url %>" class="progressive replace">
//               <img author="<%= post.post.author %>" src="" id="<%= post.post._id %>" class="post img-responsive lozad preview">
//           </a>   
//         <% } else if(['pdf','docx','txt'].indexOf(post.post.type) >= 0) { %>
//             <iframe src="<%= post.post.static_url %>">
//                 <img author="<%= post.post.author %>" src="" id="<%= post.post._id %>" class="post img-responsive lozad preview">
//             </iframe> 
//         <% } else if(['mp3','wav','ogg','mpeg'].indexOf(post.post.type) >= 0) { %>
//               <audio controls width="50%;">
//                   <source src="<%= post.post.static_url %>">
//               </audio>         
//         <% } else { %>
//         <video author="<%= post.post.author %>" src="<%= post.post.static_url %>" id="<%= post.post._id %>" class="post img-responsive" controls></video>
//         <% } %>
//         </center>
//         <% } %>
//       </div>
//       <div class="gram-card-content">
  
//         <p><a style="color:indianred;" class="gram-card-content-user" href="/u/@<%= post.post.author %>"><%= post.post.author %></a>
//           <%= post.post.caption %>
//           <span class="label label-info"><%= post.post.category %></span>
  
//        </p>
//         <p class="comments"><%= post.post.comments.length %> comment(s).</p>
//         <br>
//         <div class="comments-div" id="comments-<%= post.post._id %>">
//           <div>
//             <% for(var c=0;c<post.post.comments.length;c++) { %>
//             <a class="user-comment" href="/u/@<%= post.post.comments[c].by %>">
//             <%= post.post.comments[c].by %>
//           </a>
//           <%= post.post.comments[c].text %>
//           <br>
//           <% } %>
//           </div>
//         </div>
//         <hr>
//       </div>
//       <div class="gram-card-footer">
//         <button data="post.post.likes" <% if(post.post.likes.includes(user.username)) { %> disabled <% } %>onclick="this.innerHTML =  '<i class=\'glyphicon glyphicon-thumbs-up\'></i> ' + (parseInt(<%= post.post.likes.length %>) + 1); this.disabled = true;" class="footer-action-icons likes btn btn-link non-hoverable like-button-box" author="<%= post.post.author %>" id="<%= post.post._id %>-like">
//           <i class="glyphicon glyphicon-thumbs-up"></i> <%= post.post.likes.length %></button>
  
//         <input id="<%= post.post._id %>" class="comments-input comment-input-box" author="<%= post.post.user %>" commentby="<%= user.username %>"  type="text" id="comment" placeholder="Click enter to comment here..."/>
  
//       </div>
//     </div>
//     <% } %>

    var data = "";

    posts.forEach(function(post) {
        data = data + `<div class="gram-card">
        <div class="gram-card-header">
        <img src="${post.author.profile_picture}" class="gram-card-user-image lozad">
        <a class="gram-card-user-name" href="/u/@${post.author.username}">${post.author.username}</a>
        <div class="dropdown gram-card-time">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"> <i class="glyphicon glyphicon-option-vertical"></i></a>
        <ul class="dropdown-menu dropdown-menu-right">
        <li><a href="${post.post.static_url}"><i class="fa fa-share"></i> View</a></li>`;

        if(post.author.username == user.username) {
            data = data + `<li><a href="/me/post/${post.post._id}"><i class="fa fa-cog"></i> Edit</a></li>
            <li><a href="/me/post/delete/${post.post._id}"><i class="fa fa-trash"></i> Delete</a></li>`;
        }

        data = data + `</ul></div><div class="time"><%= post.post.timeago %></div></div><br><br><div class="gram-card-image">`;
        
        if(post.post.code) {
            data = data + `<pre style="margin:5px;"><code class="language-${post.post.lang}">${post.post.code}</code></pre>`;
        }
        if(post.post.static_url) {
            if(['png','jpeg','jpg','gif','svg'].indexOf(post.post.type) >= 0) {
                data = data + `<center><a href="${post.post.static_url}" class="progressive replace"><img author="${post.post.author}" src="" id="${post.post._id}" class="post img-responsive lozad preview"></a></center>`;
            } else if(['pdf','docx','txt'].indexOf(post.post.type) >= 0) {
                data = data + `<center><iframe src="${post.post.static_url}"><img author="${post.post.author}" src="" id="${post.post._id}" class="post img-responsive lozad preview"></iframe> </center>`;
            } else if(['mp3','wav','ogg','mpeg'].indexOf(post.post.type) >= 0) {
                data = data + `<center><audio controls width="50%;"><source src="${post.post.static_url}"></audio></center>`;
            } else {
                data = data + `<center><video author="${post.post.author}" src="${post.post.static_url}" id="${post.post._id}" class="post img-responsive" controls></video></center>`;
            }
        }

        data = data + `</div>
        <div class="gram-card-content">
        <p><a style="color:indianred;" class="gram-card-content-user" href="/u/@${post.post.author}">${post.post.author}</a>
        ${post.post.caption}
        <span class="label label-info">${post.post.category}</span>
        </p>
        <p class="comments">${post.post.comments.length} comment(s).</p>
//         <br>
//         <div class="comments-div" id="comments-${post.post._id}">
//           <div>`;
        
        for(var c=0;c < post.post.comments.length;c++) {
            data = data + `<a class="user-comment" href="/u/@${post.post.comments[c].by}">
//          <a class="user-comment" href="/u/@${post.post.comments[c].by}">
//          ${post.post.comments[c].by}
//          </a>
//          ${post.post.comments[c].text}
//          <br>`;
        }
        data = data + `</div></div><hr></div><div class="gram-card-footer"><button data="post.post.likes"`;
        if(post.post.likes.includes(user.username)) data = data + `disabled`;
        data = data + `onclick="this.innerHTML =  '<i class=\'glyphicon glyphicon-thumbs-up\'></i> ' + ${parseInt(post.post.likes.length) + 1}; this.disabled = true;" class="footer-action-icons likes btn btn-link non-hoverable like-button-box" author="${post.post.author}" id="${post.post._id}-like">
//      <i class="glyphicon glyphicon-thumbs-up"></i>${post.post.likes.length}</button>
//      <input id="${post.post._id}" class="comments-input comment-input-box" author="${post.post.user}" commentby="${user.username}"  type="text" id="comment" placeholder="Click enter to comment here..."/></div></div>`;
})