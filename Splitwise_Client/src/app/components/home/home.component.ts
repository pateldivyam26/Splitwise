import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  texts: string[] = ['on trips.', 'with housemates.', 'with your partner.', 'with anyone.'];
  colors: string[] = ['#1CC29F', '#8656CD', '#A6002F', '#ff5216'];
  currentText: string = this.texts[0];
  currentColor: string = this.colors[0];
  currentIndex: number = 0;

  ngOnInit(): void {
    this.changeContent();
  }

  changeContent(): void {
    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.texts.length;
      this.currentText = this.texts[this.currentIndex];
      this.currentColor = this.colors[this.currentIndex];
    }, 4000);
  }
}