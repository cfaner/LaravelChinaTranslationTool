let database = {
	prefix : "lc_translation_",
	getItem : function( key )
	{
		return localStorage.getItem( this.prefix + key );
	},
	setItem : function( key , value )
	{
		localStorage.setItem( this.prefix + key , value );
	}
};

let currentSelectionWord = '';

let words = {
	data : {} ,
	push : function( word )
	{
		if(word == '') return;
		
		let reg = /^[A-Za-z]+$/;
		
		if ( !reg.test( word ) )
		{
			return;
		}

		if( this.data[word] != undefined )
		{
			this.data [word] = this.data [word] + 1;
		}
		else
		{
			this.data [word] = 1;
		}
	},
	result : function () {
		return this.data;
	}
};

let moshengWordData = database.getItem('new_word');

let mosheng = {
	word : []
}

if(moshengWordData)
{
	mosheng = JSON.parse(moshengWordData);
}

function updateNewWord()
{
	$(".translation-item > p").each(function(i,obj){
		
		let html = $(obj).html();
		
		for(let w of mosheng.word )
		{
			let exp = new RegExp( w , 'g' );
			html = html.replace( exp , "<span style='color:red;font-weight:800;'>"+w+"</span>");
		}
		
		$(obj).html(html);
	});
}

$(".translation-item > p").each(function(i,obj){
	
	let content = $(obj).text();
	
	content = content.replace("&nbsp;"," ");
	
	let c = content.split(" ");
 
	for(let w of c )
	{
		words.push(w);
	}
	
	let html = $(obj).html();
	
	for(let w of mosheng.word )
	{
		let exp = new RegExp( w , 'g' );
		html = html.replace( exp , "<span style='color:red;font-weight:800;'>"+w+"</span>");
	}
	
	$(obj).html(html);
});

document.addEventListener("dblclick", on_mouse_dbclick, true);

window.success_jsonpCallback = function (data)
{
	console.log(data);
}

function on_mouse_dbclick(event) {
	currentSelectionWord = $.trim( $.selection('text') );
	$("#translation-box").show();
	$("#translation-box").css({
		"left": event.pageX + "px",
		"top":  ( event.pageY + 10 ) + "px",
	});
	
	$("#translation-net-result").html("获取中,请稍后!");
	
	chrome.runtime.sendMessage({action: "get_net_translation_result" , "word" : currentSelectionWord }, function(response) {
		$("#translation-net-result").html("");
		$( response.result.translation ).each(function(i,obj){
			$("#translation-net-result").append( obj );
		});
	});
}

$("body").append('<div id="translation-box"><a href="javascript:;" id="btn-shengci">生词</a><div id="translation-net-result"></div></div>');

$("#translation-box").css({
	"position":"absolute",
	"background-color":"#FFF",
	"left":"0px",
	"top":"0px",
	"border":"1px solid #d3e0e9",
	"padding":"15px",
	"display":"none",
	"-webkit-box-shadow":"0px 1px 2px 0 rgba(101, 129, 156, 0.08)",
	"box-shadow":"0px 1px 2px 0 rgba(101, 129, 156, 0.08)"
});

$("#btn-shengci").on('click',function(){
	mosheng.word.push(currentSelectionWord);
	let mosheng_str = JSON.stringify(mosheng); 
	database.setItem("new_word",mosheng_str);
	$("#translation-box").hide();
	updateNewWord();
});