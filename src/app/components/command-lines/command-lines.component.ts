import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommandService, CommandLineResponse } from '../../services/command.service';

@Component({
  selector: 'app-command-lines',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './command-lines.component.html',
  styleUrls: ['./command-lines.component.css'],
})
export class CommandLinesComponent implements OnInit {
  lines: CommandLineResponse[] = [];
  loading = false;
  cmdId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private cmdService: CommandService,
  ) {}

  ngOnInit(): void {
    const idStr = this.route.snapshot.paramMap.get('id');
    this.cmdId = idStr ? +idStr : null;
    if (this.cmdId !== null) {
      this.loadLines();
    }
  }

  loadLines(): void {
    if (this.cmdId === null) return;
    this.loading = true;
    this.cmdService.getCommandLinesByPid(this.cmdId).subscribe({
      next: (res) => {
        this.lines = res;
        this.loading = false;
      },
      error: () => {
        this.lines = [];
        this.loading = false;
      },
    });
  }
}
