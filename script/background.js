let appKey = APP_ID;
let key = APP_SCRET; 
 
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {  
	if (request.action == "get_translation_box_tpl")
	{	
		var xhr = new XMLHttpRequest();
		xhr.open("GET", chrome.extension.getURL('/html/tpl/translation-box.html'), true);
		xhr.onreadystatechange = function() {
		  if (xhr.readyState == 4) {
			sendResponse({result: xhr.responseText });
		  }
		};
		xhr.send();
		return true;
	} 
});

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {  
	if (request.action == "get_net_translation_result")
	{	
		var salt = (new Date).getTime();
		var query = request.word ;

		var from = 'en';
		var to = 'zh-cn';
		var str1 = appKey + query + salt +key;
		var sign = md5(str1);

		$.ajax({
			url: 'https://openapi.youdao.com/api',
			type: 'POST',
			dataType: 'jsonp',
			data: {
				q: query,
				appKey: appKey,
				salt: salt,
				from: from,
				to: to,
				sign: sign
			},
			success: function (result) {
				console.log( result );
				sendResponse({result: result });  
			} 
		});
		
		return true;
	} 
});
