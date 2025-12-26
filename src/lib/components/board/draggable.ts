import { Color, getCoordinate, LETTERS, roundToNearestHundred } from "@/index";
import { publish } from "@/stomp";
import { getFEN, getLegalMoves, playMove } from "@/wasm/chess-engine";

export default class Draggable {
  selectedElement: HTMLDivElement | null = null;
  isDragging = false;
  offset = { x: 0, y: 0, width: 0, height: 0 };
  from = '';
  to = '';
  color: Color;
  roomId: string | undefined;
  onBoardChange?: (newFen: string) => void;

  constructor(color: Color, roomId?: string, onBoardChange?: (newFen: string) => void) {
    this.color = color;
    this.roomId = roomId;
    this.onBoardChange = onBoardChange;
  }

  startDrag(event: MouseEvent) {
    const target = event.target as HTMLDivElement;
    const board = document.querySelector('#board') as HTMLDivElement;
    if (target.id.startsWith('piece') && event.button === 0) {
      this.selectedElement = target;
      this.selectedElement.style.zIndex = '2';
      this.selectedElement.style.cursor = 'grabbing';
      const boundingRect = target.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      // Calculate the offset between mouse position and element position
      this.offset = {
        width: boundingRect.width,
        height: boundingRect.height,
        x: boundingRect.height / 2 + boardRect.left,
        y: boundingRect.width / 2 + boardRect.top,
      };
      const xPercent = (100 * (event.clientX - this.offset.x)) / boundingRect.width;
      const yPercent = (100 * (event.clientY - this.offset.y)) / boundingRect.height;

      const { col, row } = getCoordinate(this.color, xPercent, yPercent);

      this.from = LETTERS[col] + row;

      event.preventDefault();
      this.selectedElement.style.transform = `translate(${xPercent}%, ${yPercent}%)`;
      this.selectedElement.addEventListener('mousemove', this.drag.bind(this));
      this.selectedElement.addEventListener('mouseup', this.endDrag.bind(this));
      this.isDragging = true;
    }
  }

  drag(event: MouseEvent) {
    if (this.selectedElement && this.isDragging) {
      event.preventDefault();
      const xPercent = (100 * (event.clientX - this.offset.x)) / this.offset.width;
      const yPercent = (100 * (event.clientY - this.offset.y)) / this.offset.height;
      this.selectedElement.style.transform = `translate(${xPercent}%, ${yPercent}%)`;
    }
  }

  endDrag(event: MouseEvent) {
    if (this.isDragging && this.selectedElement) {
      // Restore appearance
      this.isDragging = false;
      //selectedElement.style.transform = "";
      const xPercent = roundToNearestHundred((100 * (event.clientX - this.offset.x)) / this.offset.width);
      const yPercent = roundToNearestHundred((100 * (event.clientY - this.offset.y)) / this.offset.height);
      const { col, row } = getCoordinate(this.color, xPercent, yPercent);
      this.to = LETTERS[col] + row;
      if (this.roomId) {
        // sendMessage(this.from, this.to);
        publish(`/app/game/${this.roomId}`, { from: this.from, to: this.to });
      } else {
        const legalMoves = getLegalMoves(this.from);
        if (legalMoves.includes(this.to)) playMove(this.from, this.to)
        const newFen = getFEN();
        console.log('New FEN after move:', newFen);
        // Notify parent component of the board state change
        if (this.onBoardChange) {
          this.onBoardChange(newFen);
        }
      }
      // Remove the global listeners
      this.selectedElement.removeEventListener('mousemove', this.drag.bind(this));
      this.selectedElement.removeEventListener('mouseup', this.endDrag.bind(this));
      this.selectedElement.style.zIndex = '1';
      this.selectedElement.style.cursor = 'grab';
      this.selectedElement = null;
    }
  }
}