//Name: Gustavo Miranda
//Student ID: 101488574

import { Injectable, signal } from '@angular/core';
import { AuthBloom, SessionBloom, UserBloom } from '../models/orchid-contracts';

@Injectable({
  providedIn: 'root',
})
export class SessionNest {
  private readonly nestKey = 'midnight-orchid-session';
  readonly liveNest = signal<SessionBloom | null>(this.restoreNest());

  rememberBloom(authBloom: AuthBloom): void {
    if (!authBloom.token || !authBloom.user) {
      return;
    }

    const keptNest: SessionBloom = {
      token: authBloom.token,
      user: authBloom.user,
      started_at: new Date().toISOString()
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.nestKey, JSON.stringify(keptNest));
    }

    this.liveNest.set(keptNest);
  }

  clearNest(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.nestKey);
    }

    this.liveNest.set(null);
  }

  hasLiveSession(): boolean {
    return !!this.liveNest()?.token;
  }

  currentUser(): UserBloom | null {
    return this.liveNest()?.user || null;
  }

  currentToken(): string | null {
    return this.liveNest()?.token || null;
  }

  private restoreNest(): SessionBloom | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const rawNest = localStorage.getItem(this.nestKey);
    if (!rawNest) {
      return null;
    }

    try {
      return JSON.parse(rawNest) as SessionBloom;
    } catch {
      localStorage.removeItem(this.nestKey);
      return null;
    }
  }
}
