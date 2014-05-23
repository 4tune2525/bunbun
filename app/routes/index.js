var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

	var defaultJob = {
		data:function(){
			var data = [];
			for(var i=0;i<20;i++){
				data.push({});
			}
			return data;
		},
		mapper:function(){
			var result ={
				inNum:0,
				totalNum:0
			};

			for(var i=0;i<120000;i++){
				var x = Math.random() * 2 - 1;
				var y = Math.random() * 2 - 1;
	
				var distance = Math.sqrt((x*x)+(y*y));

				if(distance <= 1){
					result.inNum++;
				}
				result.totalNum++;
			}

			return result;
		},
		combiner:function(memo,dataElm){

			memo = [].concat(memo);
			
			memo[0].inNum += dataElm.inNum;
			memo[0].totalNum += dataElm.totalNum;

			return memo;
		},
		partitioner:function(){
			return 0;
		},
		reducer:function(memo,dataElm){
			memo.inNum += dataElm.inNum;
			memo.totalNum += dataElm.totalNum;

			return memo;
		},
		selecter:function(notUsed,state){
			return state.inNum/state.totalNum * 4;
		}
	};

	var defaultJobJSON = JSON.stringify(defaultJob,function(key, val){
		return typeof val == 'function' ? val.toString().replace(/\s/g,' ') : val;
	});
	
	console.log(defaultJobJSON.replace(/\s/g,''));

	res.render('index', {
		title: 'bunbun',
		defaultJob:defaultJobJSON
	});
});

module.exports = router;
