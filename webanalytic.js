// ==UserScript==
// @name         VRChat Web Anal
// @namespace    e1on
// @version      1
// @description  Adds viewer to world members
// @author       Loli e1on
// @match        https://vrchat.net/*
// @grant        https://vrchat.net/*
// ==/UserScript==

function getCookie(name) {
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

var cookieAuth = getCookie("auth");
var xhr = new XMLHttpRequest();

if (cookieAuth != 'undefined') {

	// дохуя кода котороый я дето спиздил
	history.pushState = ( f => function pushState(){
	var ret = f.apply(this, arguments);
	window.dispatchEvent(new Event('pushState'));
	window.dispatchEvent(new Event('locationchange'));
	return ret;
	})(history.pushState);
	history.replaceState = ( f => function replaceState(){
	var ret = f.apply(this, arguments);
	window.dispatchEvent(new Event('replaceState'));
	window.dispatchEvent(new Event('locationchange'));
	return ret;
	})(history.replaceState);
	window.addEventListener('popstate',()=>{
	window.dispatchEvent(new Event('locationchange'))
	});

	// Смена url
	window.addEventListener('locationchange', function(){

		var path = location.pathname.split('/');

		// world card
		if ((typeof path[2] !== "undefined") && (path[2] == 'world')) {
			if ((typeof path[3] !== "undefined")) {

				var worldData = {};
				// get world info
				xhr.open("GET", "/api/1/worlds/"+path[3], true);
				xhr.onload = function (){
					worldData = JSON.parse(xhr.responseText);
					getAllUsers(worldData);
				}
				xhr.send(null);

			}
		}

	});

}

var data = {}; // instanceId => users

function getAllUsers (worldData) {
	if (worldData['instances'] !== 'undefined') {

		worldData['instances'].forEach(function(item, i, arr) {

			// get users info
			xhr.open("GET", "/api/1/worlds/"+worldData['id']+"/"+item[0], false);
			xhr.onload = function (){
				data[item[0]] = JSON.parse(xhr.responseText)['users'];
			}
			xhr.send(null);

		});

		render(worldData['id']);

	}
}

// слабонервным не смотреть
function render (worldId) {
$(document).ready(function() {
var BreakException = {};
try {
	Object.keys(data).forEach(function (item){
			var el = $('a[href="vrchat://launch?ref=vrchat.com&id='+worldId+':'+item+'"]');

			if (el.length){
				data[item].forEach(function (item,i,arr){
					el.after('<a href="/home/user/'+item['id']+'" target="_blank" style="display: inline-block;font-size: 12px;width: 130px;text-align: center;background: #333333;border: 1px solid #333333;margin-bottom: 5px;"><img src="'+item['currentAvatarImageUrl']+'">'+item['displayName']+'</a>');
				});
			} else {
				render(worldId);
				throw BreakException;
				return;
			}
	});
	data={};
} catch (e) {
  if (e !== BreakException) throw e;
}
});
}
