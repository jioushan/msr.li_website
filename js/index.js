var per = 0;
var timer;
timer = setInterval(function() {
	$('.bar').css('width', per + '%');
	per += 1;
	if (per > 100) {
		$('.pageLoading').addClass('complete');
		setTimeout(function() {
			$('.monsterText').html('<h2>loading...</h2><h3>如果页面未跳转</h3><h4 class="smal">请手动点击此按钮</h4></br><div class="button"><a href="/v1">Next</a></div>');
			$("#rem").empty();
		}, 2700);
		clearInterval(timer);
	}
}, 30);
setTimeout(function() {
	$('.addtext').append('.');
}, 500);
setTimeout(function() {
	$('.addtext').append('.');
}, 900);
setTimeout(function() {
	$('.addtext').append('.');
}, 1200);
setTimeout(function() {
	$('.addtext').html('加载中...')
}, 1400);
setTimeout(function() {
	$('.addtext').append('.');
}, 1700);
setTimeout(function() {
	$('.addtext').append('.');
}, 2300);
setTimeout(function() {
	$('.addtext').append('.');
}, 2600);