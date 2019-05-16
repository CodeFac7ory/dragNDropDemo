// Images can be dragged from left panel to right, from right to left
// On the right pannel images are added to the end of the target row if it not full,
// or to the end on the last non empty row or to the new row
// Images are added to the end of the target row
// Double ckick to select visible area of cropped image
// Double click again to finish selection of the visible area
window.onload = function(){

	let leftPanel = document.getElementById("leftPanel");
	let rightPanel = document.getElementById("rightPanel");

	// Prevent default drag behaviors
	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(eventName) {
	  leftPanel.addEventListener(eventName, preventDefaults, false)
	  document.body.addEventListener(eventName, preventDefaults, false)
	})

	let dragSrcEl = null;

	function handleDragStart (e) {
	  // Target (this) element is the source node.
	  // this.style.opacity = '0.4';
	  dragSrcEl = this;
	  e.dataTransfer.effectAllowed = 'move';
	}

	// Handle files to left panel
	leftPanel.addEventListener('drop', handleDropLeft, false);

	function preventDefaults (ev) {
	  ev.preventDefault()
	  ev.stopPropagation()
	}

	function handleDropLeft(ev) {

	  const dt = ev.dataTransfer
	  const files = dt.files

	  if (files.length > 0) {
	  	handleFiles(files)
	  }
		// Ignore drag n drop from left panel to itself
	  else if (dragSrcEl.parentNode.id !== 'gallery') {
	  	handleFromRight(ev);
	  }
	}

	// Handle the files dragged from desktop
	// Multiple files can be dragged from desktop
	function handleFiles(files) {
	  files = [...files]
	  files.forEach(previewFile)
	}

	// Read the file dragged from desktop
	function previewFile(file) {
	  let reader = new FileReader()
	  reader.readAsDataURL(file)
	  reader.onloadend = function() {

	    let img = document.createElement('img');
	    img.src = reader.result;

			img.setAttribute('draggable', true);
			img.style.height = "150px"

  		img.addEventListener('dragstart', handleDragStart, false);
	    document.getElementById('gallery').appendChild(img);
	    document.getElementById('gallery').appendChild(document.createElement("p"));
	  }
	}

	function handleFromRight(ev) {

		const data = ev.dataTransfer.getData("Text");

		const sourceRow = dragSrcEl.parentNode.parentNode;
		sourceRow.removeChild(dragSrcEl.parentNode);

		if(data){
			const img = document.createElement('img');
			img.src = data;
			img.setAttribute('draggable', true);
  		img.addEventListener('dragstart', handleDragStart, false);
			img.style.height = "150px"
			document.getElementById('gallery').appendChild(img);
	    document.getElementById('gallery').appendChild(document.createElement("p"));
	  }

		ev.preventDefault();
	}

	function allowDrop(ev) {
		ev.preventDefault();
	}

	// Draggable image is added to target row if the row is not full
	// If it is full it is added to the next row
	function handleDropRight(ev) {
		ev.preventDefault();
		var data = ev.dataTransfer.getData("Text");

		if (!data || !dragSrcEl) {
			return;
		}

		if (dragSrcEl === ev.target) {
			return;
		}

		// If source is left panel
		if (dragSrcEl.parentNode.id === 'gallery') {

			dragSrcEl.parentNode.removeChild(dragSrcEl);
		}
		// If source is right panel
		else {
			dragSrcEl.parentNode.parentNode.removeChild(dragSrcEl.parentNode);
		}

		let targetRow;

		// Image is dropped onto image
		if (ev.target.classList.contains('draggable')) {
			targetRow = ev.target.parentNode.parentNode;
		}
		// Image is dropped into container
		else if (ev.target.classList.contains('img-container')) {
			targetRow = ev.target.parentNode;
		}
		// Image is dropped into row
		else if (ev.target.classList.contains('list')) {
			targetRow = ev.target;
		}

		const img = document.createElement('img');
		img.src = data;
		img.setAttribute('draggable', true);
		img.addEventListener('dragstart', handleDragStart, false);

		img.style.width = "100%";
		img.className += " draggable";

		// I took jQuery because it was easier to remove event handlers
		// Move cropped image insinde container
		$(img).on('dblclick', function startMoving(ev) {
			ev.preventDefault()
			ev.stopPropagation();

			img.style.cursor = 'grab';
			const target = ev.target;

			let _LAST_MOUSE_POSITION = { x: event.pageX, y: event.pageY };
			const _DIV_OFFSET = target.parentNode.getBoundingClientRect();
			const _CONTAINER_HEIGHT = _DIV_OFFSET.bottom - _DIV_OFFSET.top;
			const _CONTAINER_WIDTH = _DIV_OFFSET.right - _DIV_OFFSET.left;

			const _IMAGE_OFFSET = target.getBoundingClientRect();
			const _IMAGE_HEIGHT = _IMAGE_OFFSET.bottom - _IMAGE_OFFSET.top;
			const _IMAGE_WIDTH = _IMAGE_OFFSET.right - _IMAGE_OFFSET.left;

			$(img).on('mousemove', function move(ev) {
				ev.preventDefault()
				ev.stopPropagation();

				const current_mouse_position = {
					x: event.pageX - _DIV_OFFSET.left,
					y: event.pageY - _DIV_OFFSET.top
				};

				let change_x = current_mouse_position.x - _LAST_MOUSE_POSITION.x;
				let change_y = current_mouse_position.y - _LAST_MOUSE_POSITION.y;

				_LAST_MOUSE_POSITION = current_mouse_position;

				let img_top;
				let img_left;

				if (!target.style.top) {
					img_top = 0;
				}
				else {
					img_top = parseInt(target.style.top, 10);
				}

				if (!target.style.left) {
					img_left = 0;
				}
				else {
					img_left = parseInt(target.style.left, 10);
				}

				let img_top_new = img_top + change_y;
				let img_left_new = img_left + change_x;

				// Validate top and left do not fall outside the image,
				// otherwise white space will be seen */
				if(img_top_new > 0) {
					img_top_new = 0;
				}

				if(img_top_new < (_CONTAINER_HEIGHT - _IMAGE_HEIGHT)) {
					img_top_new = _CONTAINER_HEIGHT - _IMAGE_HEIGHT;
				}

				if(img_left_new > 0) {
					img_left_new = 0;
				}

				if(img_left_new < (_CONTAINER_WIDTH - _IMAGE_WIDTH)) {
					img_left_new = _CONTAINER_WIDTH - _IMAGE_WIDTH;
				}

				img.style.position = "absolute";
				img.style.top = img_top_new + 'px'
				img.style.left = img_left_new + 'px';
			});

			// Stop moving image on second double click
			$(img).off('dblclick');
			$(img).on('dblclick', function stopMoving(ev) {
				ev.preventDefault()
				ev.stopPropagation();

				img.style.cursor = 'context-menu';
				$(img).off('mousemove');
				$(img).off('dblclick');
				$(img).on('dblclick', startMoving);

		    return false;
			});
		});

		const div = document.createElement('div');
		div.className += " col img-container";
		div.appendChild(img);

		// Handles case where image is dropped directly to top level right panel
		if (ev.target.id === 'rightPanel' || (
			targetRow && targetRow.childElementCount > 2
		)) {
			let lastRow = document.querySelectorAll(".list")[document.querySelectorAll(".list").length -1];

			if (lastRow.childElementCount > 2) {

				const div = document.createElement('div');
				div.className += "row border border-3 list";

				lastRow.parentNode.appendChild(div);
				lastRow = document.querySelectorAll(".list")[document.querySelectorAll(".list").length -1];
			}

			targetRow = lastRow;
		}

		targetRow.appendChild(div);

		// Reset image positions inside target row
		const targetRowImages = Array.prototype.slice.call(targetRow.querySelectorAll("img"));
		targetRowImages.forEach(function(image) {
			image.style.top = '0px';
			image.style.left = '0px';
		});
	}

	rightPanel.addEventListener('drop', handleDropRight, false)
}




