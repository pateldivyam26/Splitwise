import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  groupId: string = '';
  groupName: string = '';
  groupIconColor: string = '';

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe(res => {
      this.groupId = res['groupId'];
      this.groupService.getGroupDetails(this.groupId).subscribe(response => {
        this.groupName = response.name;
        this.groupIconColor = this.getRandomColor();
      });
    });
  }

  navigate(event: any): void {
      const routeName = (event.target as HTMLInputElement).value
      this.router.navigate(['dashboard/groups', this.groupId, routeName], { queryParams: { groupId: this.groupId } });
    }

  onSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.navigate(selectElement.value);
  }

  getRandomColor(): string {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
