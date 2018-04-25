let database = {
	prefix : "lc_translation_",
	getItem : function( key )
	{
		return localStorage.getItem( this.prefix + key.toLowerCase() );
	},
	getJSONItem : function( key )
	{
		let temp = localStorage.getItem( this.prefix + key.toLowerCase() );
		if(!temp) return null;
		return JSON.parse(temp) ;
	},
	setItem : function( key , value )
	{
		localStorage.setItem( this.prefix + key.toLowerCase() , value );
	},
	setJSONItem : function( key , value )
	{
		value = JSON.stringify( value );
		localStorage.setItem( this.prefix + key.toLowerCase() , value );
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

let newWordDataListFromDatabase = database.getJSONItem('new_word');

let newWordDataList = {
	word : []
}

if(newWordDataListFromDatabase)
{
	newWordDataList = newWordDataListFromDatabase;
}

function inNewWordList(word)
{
	return $.inArray( word , newWordDataList.word ) >= 0;
}

function updateNewWord()
{
	$(".translation-item > p").each(function(i,obj){
		
		let html = $(obj).html();
		
		let exp = new RegExp( '<span.*?>(.*?)<\/span>' , 'g' );
		html = html.replace( exp , "$1");

		for(let w of newWordDataList.word )
		{
			let exp = new RegExp( '([^A-Za-z0-9])'+w+'([^A-Za-z0-9])' , 'g' );
			html = html.replace( exp , "$1<span style='color:red;font-weight:800;'>"+w+"</span>$2");
		}
		
		$(obj).html(html);
	});
}

updateNewWord();

$(".translation-item > p").each(function(i,obj){
	
	let content = $(obj).text();
	
	content = content.replace("&nbsp;"," ");
	
	let c = content.split(" ");
 
	for(let w of c )
	{
		words.push(w);
	}
});

document.addEventListener("dblclick", on_mouse_dbclick, true);

function writeTranslantionResultToHtml(result)
{
	$("#translation-net-result").html("");
	
	if(result.basic != undefined && result.basic.explains != undefined)
	{
		$( result.basic.explains ).each(function(i,obj){
			$("#translation-net-result").append( obj + "<br />" );
		});
	}
	
	if( result.translation != undefined)
	{
		$( result.translation ).each(function(i,obj){
			$("#translation-net-result").append( obj + "<br />" );
		});
	}
	
}

function getWordTranslationResult( word , callback )
{
	let cacheTranslationResult = database.getJSONItem( 'word_cache_' + word.toLowerCase() );
	
	if( cacheTranslationResult )
	{
		callback( cacheTranslationResult ) ;
	}
	else
	{
		chrome.runtime.sendMessage({action: "get_net_translation_result" , "word" : word }, function(response) {
			console.log(response.result);
			database.setJSONItem('word_cache_' + word.toLowerCase() , response.result );
			callback( response.result ) ;
		});
	}

}

function on_mouse_dbclick(event) {
	currentSelectionWord = $.trim( $.selection('text') ) ;
	
	if(!currentSelectionWord) return;
	
	$("#translation-box").show();
	$("#translation-box").css({
		"left": event.pageX + "px",
		"top":  ( event.pageY + 10 ) + "px",
	});
	
	$("#translation-net-result").html("获取中,请稍后!");
	getWordTranslationResult( currentSelectionWord ,function( result ){
		writeTranslantionResultToHtml( result );
	});

	if( inNewWordList( currentSelectionWord ))
	{
		$("#btn-cancel-new-word").show();
		$("#btn-new-word").hide();
	}
	else
	{
		$("#btn-cancel-new-word").hide();
		$("#btn-new-word").show();
	}
}

$("body").append('<div id="translation-box"><a href="javascript:;" id="btn-cancel-new-word" style="display:none;">取消</a><a href="javascript:;" id="btn-new-word">生词</a><div id="translation-net-result"></div></div>');

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

$("#btn-new-word").on('click',function(){
	newWordDataList.word.push(currentSelectionWord);
	database.setJSONItem("new_word",newWordDataList);
	$("#translation-box").hide();
	updateNewWord();
});

$("#btn-cancel-new-word").on('click',function(){
	
	newWordDataList.word.splice($.inArray( currentSelectionWord , newWordDataList.word ),1);
	
	database.setJSONItem("new_word",newWordDataList);
	
	$("#translation-box").hide();
	
	updateNewWord();
});
