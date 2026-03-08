import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommandService, CommandResponse } from '../../services/command.service';

@Component({
  selector: 'app-commands-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './commands-list.component.html',
  styleUrls: ['./commands-list.component.css'],
})
export class CommandsListComponent implements OnInit {
  commands: CommandResponse[] = [];
  loading = false;

  constructor(private commandService: CommandService) {}

  ngOnInit(): void {
    this.loadCommands();
  }

  loadCommands(): void {
    this.loading = true;
    this.commandService.getCommands().subscribe({
      next: (res) => {
        this.commands = res;
        this.loading = false;
      },
      error: () => {
        this.commands = [];
        this.loading = false;
      },
    });
  }

  approve(command: CommandResponse): void {
    this.commandService.updateCommandApproval(command.commandId, 1).subscribe({
      next: () => this.loadCommands(),
    });
  }

  delete(command: CommandResponse): void {
    this.commandService.deleteCommand(command.commandId).subscribe({
      next: () => this.loadCommands(),
    });
  }
}
