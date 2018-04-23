
let words = {
	data : {} ,
	push : function( word )
	{
		if(word == '') return;
		
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

$(".translation-item > p").each(function(i,obj){
	
	let content = $(obj).text();
	
	let c = content.split(" ");
 
	for(let w of c )
	{
		words.push(w);
	}
	
	let html = $(obj).html();
	
	html = html.replace('can','<b>can</b>');
	
	$(obj).html(html);
});

 
console.log(words.result());