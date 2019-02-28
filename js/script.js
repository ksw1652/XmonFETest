import Memo from './Memo.js';
import MemoService from './MemoService.js';

let memoService;

/**
 * 컨텐츠 로드 이벤트
 */
document.addEventListener("DOMContentLoaded", () => {
	memoService = new MemoService();
	memoService.init();
	makeMemos();
	bindBackgroundEvent();
});

/**
 * makeMemos function
 * 
 * localStorage에 저장된 메모들을 load하는 함수
 */
const makeMemos = () => {
	memoService.findMemos()
		.then((memos) => {
			memos.map((memo) => {
				return new Memo(memo.identifier, memo.content, memo.position, memo.size, memo.order);
			});
		})
		.catch((error) => {
			console.log("error::\n", error);
		});
};

/**
 * bindBackgroundEvent function
 * 바탕화면 우클릭 이벤트 바인딩 함수
 */
const bindBackgroundEvent = () => {
	let wrap = document.getElementsByClassName("wrap")[0];
	
	wrap.addEventListener('contextmenu', (e) => {
		//타 이벤트와 중복하여 trigger 하는 것을 방지
		if (e.target !== e.currentTarget) return;
		e.preventDefault();
		
		memoService.findHighestOrder()
			.then((order) => {
				const memo = new Memo(
					`memo_${order + 1}`,
					'',
					{top: e.pageY, left: e.pageX},
					{width: 200, height: 100}, order + 1
				);
				return memoService.createMemo({
					identifier: memo.identifier, content: memo.content, position: memo.position, size: memo.size, order: memo.order
				});
			})
			.then(() => {
				return false;
			})
			.catch((error) => {
				console.log("error::\n", error);
				
			});
	});
};
