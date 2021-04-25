(function() {
  var page = 1;
  var finished;
  var lastSorted = "feed";
  $(".sort-btn").on("click", function() {
    $(".sort-btn").removeClass("active");
    $(this).addClass("active");
    lastSorted = $(this)
      .text()
      .toLowerCase();
    finished = false;
    $("#posts").html("");
    getPosts(1, lastSorted);
  });
  function getPosts(page = 1, sort = lastSorted) {
    if (page == 1) var method = "prepend";
    else var method = "append";
    $.ajax(`/api/v1/posts?page=${page}&sort=${sort}`).done(function(posts) {
      if (finished) return;
      if (posts.length == 0) {
        finished = true;
        $("#posts").append(
          '<h2 style="text-align: center;color:#155263">You are all up to date!</h2><br><br>'
        );
      }
      posts.reverse();
      posts.forEach(p =>
        $("#posts")[method](`<div class="gram-card">
                <div class="gram-card-header">
                  <img src="${
                    p.author.profile_picture
                  }?cache=${Math.random()}" class="gram-card-user-image lozad">
                  <a class="gram-card-user-name" href="/u/@${
                    p.author.username
                  }">${p.author.username}</a>
            
                        <div class="dropdown gram-card-time">
                          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"> <i class="glyphicon glyphicon-option-vertical"></i></a>
                          <ul class="dropdown-menu dropdown-menu-right">
                          ${
                            p.post.static_url != undefined
                              ? "<li><a href=" +
                                p.post.static_url +
                                '><i class="fa fa-share"></i> View</a></li>'
                              : ""
                          }
                        ${
                          p.owner
                            ? `
                              <li><a href="/me/post/${p.post._id}"><i class="fa fa-cog"></i> Edit</a></li>
                              <li><a href="/me/post/delete/${p.post._id}"><i class="fa fa-trash"></i> Delete</a></li>
                            `
                            : ""
                        }
                          </ul>
                          </div>
                          <div class="time">${p.post.timeago}</div>
                </div>
            <br>
            <br>
                <div class="gram-card-image">
                <center>
                  ${
                    p.post.static_url
                      ? (`${
                          ["png", "jpeg", "jpg", "gif", "svg"].indexOf(
                            post.post.type
                          ) >= 0
                          ? }` 
                    <a href="${p.post.static_url}" class="progressive replace">
                        <img author="${p.author.username}" src="" id="${p.post._id}" class="post img-responsive lozad preview">
                    </a>        
                  ` : `${['pdf','docx','txt'].indexOf(post.post.type) >= 0}` ? 
                  `
                  <iframe src="<%= post.post.static_url %>">
                  <img author="<%= post.post.author %>" src="/images/load.gif" id="<%= post.post._id %>" class="post img-responsive lozad preview">
                  </iframe> 
                  ` : `${['mp3','wav','ogg','mpeg'].indexOf(post.post.type) >= 0}` ?
                  `<audio controls>
                  <source src="<%= post.post.static_url %>">
                  </audio> 
                  ` : `
                  <video author="${p.author.username}" src="${p.post.static_url}" id="${p.post._id}" class="post img-responsive" controls></video>
                  `
                        }`
                      : p.post.code
                      ? `<pre style="margin:5%"><code class="language-${p.post.lang}">${p.post.code}</code></pre>`
                      : ""
                  }
                  </center>
                </div>
                <div class="gram-card-content">
            
                  <p><a class="gram-card-content-user" href="/u/@${
                    p.author.username
                  }">${p.author.username}</a>
                  ${p.post.caption}
                    <span class="label label-info">${
                      p.post.category
                        ? p.post.category
                        : p.post.code
                        ? "Code"
                        : "Unknown"
                    }</span>
            
                 </p>
            
                  <p class="comments">${p.post.comments.length} comment(s).</p>
                  <br>
            
                  <div class="comments-div" id="comments-${p.post._id}">
            
                   ${p.post.comments
                     .map(
                       c => `
                    <a class="user-comment" href="/u/@${c.by}">
                        ${c.by}
                    </a>
                    ${c.text}
                    <br>
                   `
                     )
                     .join("")}
            
                  </div>
                <hr>
                </div>
            
                <div class="gram-card-footer">
                  <button data="${JSON.stringify(p.post.likes)}" ${
          p.post.likes.includes($("#posts").attr("username")) ? "disabled" : ""
        } onclick="this.innerHTML =  ${`'<i class=\\'glyphicon glyphicon-thumbs-up\\'></i> ' + (parseInt(${p.post.likes.length}) + 1); this.disabled = true;`}" class="footer-action-icons likes btn btn-link non-hoverable like-button-box" author="${
          p.author.username
        }" id="${p.post._id}-like">
                    <i class="glyphicon glyphicon-thumbs-up"></i> ${
                      p.post.likes.length
                    }</button>
            
                  <input id="${
                    p.post._id
                  }" class="comments-input comment-input-box" author="${
          p.author
        }" type="text" id="comment" placeholder="Click enter to comment here..."/>
            
                </div>
            
              </div>`)
      );

      $(".like-button-box").off("click");
      $(".like-button-box").on("click", likeById);

      function likeById() {
        console.log(this.id);
        var author = $(`#${this.id}`).attr("author");
        $.ajax({
          method: "POST",
          url: "/api/v1/like?cache=" + Math.random(),
          data: {
            _id: this.id.toString().split("-like")[0],
            author: author
          }
        })
          .done(function(data) {
            if (data.event) {
              show_notification(data.msg, "success");
            } else {
              show_notification(data.msg, "danger");
            }
          })
          .fail(function(data) {
            show_notification("Some error while liking the feed", "danger");
            console.log(data);
          });
      }
      $(".comment-input-box").off("keydown");
      $(".comment-input-box").on("keydown", commentById);

      function commentById(key) {
        if (!this.value) return;
        else if (key.keyCode == 13) {
          var el = this;
          $.ajax({
            method: "POST",
            url: "/api/v1/comment",
            data: {
              _id: el.id,
              author: $(el).attr("author"),
              text: el.value
            }
          })
            .done(function(data) {
              $(
                "#comments-" + el.id
              ).append(`<a class="user-comment" href="/u/@dan-online">
              ${$(el).attr("author")}
          </a> ${el.value}<br>`);
              el.value = "";
              show_notification("Comment added!", "success");
            })
            .fail(function(data) {
              show_notification(
                "Some error while posting the comment.",
                "danger"
              );
              console.log(data);
            });
        }
      }
    });
  }
  getPosts();
  $(window).on("scroll", function() {
    if (finished == true) return;
    if ($(document).height() - $(document).scrollTop() < 1369) {
      page++;
      getPosts(page);
    }
  });
})();
