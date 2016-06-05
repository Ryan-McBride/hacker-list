$(document).ready(function(){
  var top;
  $.ajax({
    url: '/recent'
  })
  .done(function(data){
    top = JSON.parse(data);
    top.forEach(function(val){
      $('#main').append('<li><a href="'+val.url+'">'+val.title+'</a></br><a href="https://news.ycombinator.com/item?id='+val.id+'">comments</a> points: '+val.score+'</li>');
    })
  })
});
