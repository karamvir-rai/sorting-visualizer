"use strict"; 
(function() {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const MAXIMUM_VALUE = 250;
  const COLOR = {
    SWAP: "swap",
    CURRENT: "current",
    MINIMUM: "minimum",
    MIDPOINT: "midpoint",
    PIVOT: "pivot",
    SUCCESS: "success"
  };

  let elements;
  let delay;

  window.onload = function() {
    generateElements();

    $("selector").oninput = function() {
      $("size").textContent = $("selector").value;
      generateElements();
    }
    $("selector").onmouseup = function() {
      $("size").textContent = "";
    }
    $("new").onclick = function() { generateElements(); }
    $("start").onclick = async function() {
      let menu = $("algorithm");
      toggleControls();
      switch (menu.options[menu.selectedIndex].text) {
        case "Bubble Sort":
          await bubbleSort();
          break;
        case "Selection Sort":
          await selectionSort();
          break;
        case "Insertion Sort":
          await insertionSort();
          break;
        case "Merge Sort":
          await mergeSort(0, elements.length - 1);
          break;
        case "Quick Sort":
          await quickSort(0, elements.length - 1);
          break;
        case "Heap Sort":
          await heapSort();
          break;
        case "Bogo Sort":
          await bogoSort();
          break;
      }
      toggleControls();
      $("start").disabled = true;
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'w' && !$("new").disabled) {
        generateElements(true);
      }
    })
  }

  async function bubbleSort() {
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < (elements.length - i - 1); j++) {
        elements[j].rect.setColor(COLOR.CURRENT);
        elements[j + 1].rect.setColor(COLOR.CURRENT);
        if (elements[j].value > elements[j + 1].value) {
          await swap(j, j + 1);
        } else {
          await sleep(delay);
        }
        elements[j].rect.removeColor(COLOR.CURRENT);
        elements[j + 1].rect.removeColor(COLOR.CURRENT);
      }
    }
  }

  async function selectionSort() {
    for (let i = 0; i < elements.length; i++) {
      let minIndex = i;
      elements[minIndex].rect.setColor(COLOR.MINIMUM);
      await sleep(delay);
      for (let j = i + 1; j < elements.length; j++) {
        elements[j].rect.setColor(COLOR.CURRENT);
        if (elements[j].value < elements[minIndex].value) {
          elements[minIndex].rect.removeColor(COLOR.MINIMUM);
          elements[j].rect.setColor(COLOR.MINIMUM);
          minIndex = j;
        } else {
          await sleep(delay);
        }
        elements[j].rect.removeColor(COLOR.CURRENT);
      }
      elements[minIndex].rect.removeColor(COLOR.MINIMUM);
      if (i != minIndex) {
        await swap(i, minIndex);
      }
    }
  }

  async function insertionSort() {
    for (let i = 1; i < elements.length; i++) {
      let j = i;
      elements[i].rect.setColor(COLOR.CURRENT);
      await sleep(delay);
      while (j > 0 && elements[j].value < elements[j - 1].value) {
        await swap(j, j - 1);
        if (j == i) {
          elements[i].rect.setColor(COLOR.CURRENT);
        }
        j--;
      }
      elements[i].rect.removeColor(COLOR.CURRENT);
    }
  }

  async function mergeSort(low, high) {
    if (low < high) {
      let midpoint = parseInt((low + high) / 2);
      await mergeSort(low, midpoint);
      await mergeSort(midpoint + 1, high);
      await merge(low, high);
    }
  }

  async function merge(low, high) {
    let interations = Math.ceil(Math.log2(1 + (high - low)));
    let gap = Math.floor((1 + (high - low)) / 2 + (1 + (high - low)) % 2);
    while (interations > 0) {
      let pointerA = low;
      let pointerB = pointerA + gap;
      while (pointerB <= high) {
        elements[pointerA].rect.setColor(COLOR.CURRENT);
        elements[pointerB].rect.setColor(COLOR.CURRENT);
        if (elements[pointerB].value < elements[pointerA].value) {
          await swap(pointerA, pointerB);
        } else {
          await sleep(delay);
        }
        elements[pointerA].rect.removeColor(COLOR.CURRENT);
        elements[pointerB].rect.removeColor(COLOR.CURRENT);

        pointerA++;
        pointerB++;
      }
      gap = Math.floor(gap / 2 + gap % 2);
      interations--;
    }
  }

  async function heapSort() {
    // build max heap
    for (let i = Math.floor(elements.length / 2) - 1; i >= 0; i--) {
      await heapify(elements.length, i);
    }

    for (let i = elements.length - 1; i > 0; i--) {
      await swap(0, i);
      await heapify(i, 0);
    }
  }

  async function heapify(length, index) {
    let maxIndex = index;
    let leftChildIndex = 2 * index;
    let rightChildIndex = 2 * index + 1;

    if (leftChildIndex < length && elements[leftChildIndex].value > elements[maxIndex].value) {
      maxIndex = leftChildIndex;
    }

    if (rightChildIndex < length && elements[rightChildIndex].value > elements[maxIndex].value) {
      maxIndex = rightChildIndex;
    }

    if (maxIndex != index) {
      await swap(index, maxIndex);
      await heapify(length, maxIndex);
    }
  }

  async function quickSort(low, high) {
    if (low < high) {
      let pivotIndex = await partition(low, high);
      await quickSort(low, pivotIndex - 1);
      await quickSort(pivotIndex, high);
    }
  }

  async function partition(low, high) {
    let pivotIndex = parseInt((low + high) / 2);
    let pivotValue = elements[pivotIndex].value;
    elements[pivotIndex].rect.setColor(COLOR.PIVOT);
    await sleep(delay);

    let pointerA = low;
    let pointerB = high;

    while (pointerA <= pointerB) {
      while (elements[pointerA].value < pivotValue) {
        pointerA++;
      }
      while(elements[pointerB].value > pivotValue) {
        pointerB--;
      }
      if (pointerA <= pointerB) {
        if (pointerA != pointerB) {
          await swap(pointerA, pointerB);
          elements[pivotIndex].rect.setColor(COLOR.PIVOT);
        }
        pointerA++;
        pointerB--;
      }
    }
    await sleep(delay);
    elements[pivotIndex].rect.removeColor(COLOR.PIVOT);
    return pointerA;
  }

  async function bogoSort() {
    let response;
    let sortedElements = [...elements].sort((a, b) => (a.value > b.value ? 1 : -1));
    let sortedSequenceRecord = 0;
    do {
      shuffle();
      response = await isSorted(sortedElements);
      if (response.streak > sortedSequenceRecord) {
        let timestamp = (new Date()).toLocaleString([], { hour12: true });
        let percentSorted = (100 * response.streak / elements.length).toFixed(2) + "%";
        sortedSequenceRecord = response.streak;
        console.log("Bogosort Record: " + sortedSequenceRecord + "/" + elements.length +
                    " - " + percentSorted + " (" + timestamp + ")");
      }
      await sleep(10);
    } while(!response.sorted);
    console.log("Wow, very impressive!");
  }

  // Fisher–Yates shuffle
  function shuffle() {
    for (let i = elements.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      swap(i, j, false);
    }
  }

  async function isSorted(sortedElements) {
    if (sortedElements.length != elements.length) {
      return { sorted: false, streak: 0 };
    }
    for (let i = 0; i < sortedElements.length; i++) {
      if (sortedElements[i].value != elements[i].value) {
        elements.clearColors();
        return { sorted: false, streak: i };
      }
      elements[i].rect.setColor(COLOR.SUCCESS);
      await sleep(20 * Math.log(i + 1));
    }
    elements.clearColors();
    return { sorted: true, streak: sortedElements.length };
  }

  async function swap(a, b, animate = true) {
    if (animate) {
      await sleep(delay);
      elements[a].rect.clearClassAttributes();
      elements[b].rect.clearClassAttributes();

      elements[a].rect.setColor(COLOR.SWAP);
      elements[b].rect.setColor(COLOR.SWAP);

      await sleep(delay);
    }

    let xPositionTemp = elements[a].rect.x.baseVal.value;
    elements[a].rect.setAttribute("x", elements[b].rect.x.baseVal.value);
    elements[b].rect.setAttribute("x", xPositionTemp);

    let elementTemp = elements[a];
    elements[a] = elements[b];
    elements[b] = elementTemp;

    if (animate) {
      await sleep(delay);
      elements[a].rect.removeColor(COLOR.SWAP);
      elements[b].rect.removeColor(COLOR.SWAP);
    }
  }

  function toggleControls() {
    $("algorithm").disabled = !$("algorithm").disabled;
    $("selector").disabled = !$("selector").disabled;
    $("start").disabled = !$("start").disabled;
    $("new").disabled = !$("new").disabled;
  }

  function generateElements(worstCase = false) {
    $("start").disabled = false;
    let size = $("selector").value;
    delay = size > 50 ? 0 : -5 * (size - 10) + 250;
    let elementWidth = $("canvas").width.baseVal.value / size;
    elements = [];
    while($("canvas").firstChild) {
      $("canvas").removeChild($("canvas").firstChild);
    }
    // Two passes, one for the list of random values (ints) and one for list of
    // array element objects, to ensure heights of each svg rect is correct and
    // based on the max int value of the list.
    let randomValues = Array.from(Array(+size), function() {
      // 1 <= x <= MAXIMUM_VALUE
      return Math.floor(Math.random() * MAXIMUM_VALUE) + 1;
    });
    if (worstCase) {
      randomValues.sort((a, b) => (a > b ? -1 : 1));
    }
    randomValues.forEach((value, index) => {
      let element = createElement(value, getYPosition(value, randomValues), index, elementWidth);
      elements.push(element);
      $("canvas").appendChild(element.rect);
    });
  }

  function createElement(value, yPosition, index, width) {
    let element = {};

    let svgRect = document.createElementNS(SVG_NS, "rect");
    svgRect.setAttribute("x", width * index);
    svgRect.setAttribute("y", yPosition);
    svgRect.setAttribute("width", width);
    svgRect.setAttribute("height", "100%");
    svgRect.setAttribute("fill", "white");
    svgRect.setAttribute("stroke", "black");
    svgRect.setColor = function(cssClass) {
      this.classList.add(cssClass);
    }
    svgRect.removeColor = function(cssClass) {
      this.classList.remove(cssClass);
    }
    svgRect.clearClassAttributes = function() {
      this.classList.remove(...this.classList);
    }

    elements.clearColors = function() {
      elements.forEach((element) => {
        element.rect.clearClassAttributes();
      });
    }

    element.rect = svgRect;
    element.value = value;

    return element;
  }

  function getYPosition(value, list) {
    let domainMin = 1;
    let domainMax = Math.max(...list);

    let rangeMin = $("canvas").height.baseVal.value - 10;
    let rangeMax = 5;
    return (((rangeMax - rangeMin) * (value - domainMin)) / (domainMax - domainMin)) + rangeMin;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function $(id) {
    return document.getElementById(id);
  }
})();
