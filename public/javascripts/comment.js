$(".comment-input-box").on("keydown", commentById);

// Comment function by ID when enter is pressed...
function commentById(key) {
  if (!this.value) return;
  else if (key.keyCode == 13) {
    // Ajax post call for HTTP post
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
        ).append(`<a class="user-comment" href="/u/@${$(el).attr("commentby")}">
              ${$(el).attr("commentby")}
          </a> ${el.value}<br>`);
        el.value = "";
        show_notification("Comment added!", "success");
      })
      .fail(function(data) {
        show_notification("Some error while posting the comment.", "danger");
        console.log(data);
      });
  }
}
