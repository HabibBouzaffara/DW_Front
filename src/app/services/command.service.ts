// command.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface CommandResponse {
  commandId: number;
  userId: number;
  approved: number;
  commandLines: any[];
}

export interface CommandLineRequest {
  commandLineId: number;
  commandId: number;
  productId: number;
  quantity: number;
  command: string | null;
}

@Injectable({ providedIn: 'root' })
export class CommandService {
  private baseUrl = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/Command — no body needed, token in header (via AuthInterceptor).
   * Returns the new command with its commandId.
   */
  createCommand(): Observable<CommandResponse> {
    return this.http.post<CommandResponse>(`${this.baseUrl}/Command`, {});
  }

  /**
   * POST /api/CommandLine — sends one line per cart product.
   */
  createCommandLine(line: CommandLineRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/CommandLine`, line);
  }
}
