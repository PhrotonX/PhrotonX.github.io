function deleteCookie(cookie_name){
	document.cookie = `${cookie_name}= ; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function getCookie(name){
	var cookie = document.cookie.split(";");

	for(var i = 0; i < cookie.length; i++){
		var cookieVal = cookie[i].split("=");

		if(name == cookieVal[0].trim()){
			return decodeURIComponent(cookieVal[1]);
		}
	}
}

function createCookie(name, value, days){
	var expires;
	
	if(days){
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toGMTString();
	}else{
		expires = "";
	}
	
	document.cookie = escape(name) + "=" +
		escape(value) + expires + "; path=/";
}