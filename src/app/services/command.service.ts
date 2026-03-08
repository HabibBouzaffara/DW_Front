// command.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface CommandResponse {
  commandId: number;
  userId: number;
  email?: string;        // new field returned by backend
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

export interface CommandLineResponse {
  commandLineId: number;
  commandId: number;
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
}

export interface CommandCreateRequest {
  // When leaving undefined the backend should default to 0 (not approved).
  approved?: number;
}

@Injectable({ providedIn: 'root' })
export class CommandService {
  private baseUrl = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/Command — no body needed, token in header (via AuthInterceptor).
   * Returns the new command with its commandId.
   */
  /**
   * POST /api/Command
   * @param approved optional flag (0 or 1). 0 = pending cart, 1 = placed order.
   *                 If omitted the API should default to 0.
   */
  createCommand(approved: number = 0): Observable<CommandResponse> {
    const body: CommandCreateRequest = { approved };
    return this.http.post<CommandResponse>(`${this.baseUrl}/Command`, body);
  }

  /**
   * PUT /api/Command/{id}
   * Allows updating certain fields such as approval flag.
   */
  updateCommandApproval(commandId: number, approved: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/Command/${commandId}`, { approved });
  }

  /**
   * GET /api/Command — returns all commands.
   */
  getCommands(): Observable<CommandResponse[]> {
    return this.http.get<CommandResponse[]>(`${this.baseUrl}/Command`);
  }

  /**
   * GET /api/CommandLine/bypid/{id} — lines belonging to a command.
   */
  getCommandLinesByPid(commandId: number): Observable<CommandLineResponse[]> {
    return this.http.get<CommandLineResponse[]>(`${this.baseUrl}/CommandLine/bypid/${commandId}`);
  }

  /**
   * DELETE /api/Command/{id}
   */
  deleteCommand(commandId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Command/${commandId}`);
  }

  /**
   * POST /api/CommandLine — sends one line per cart product.
   */
  createCommandLine(line: CommandLineRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/CommandLine`, line);
  }
}
