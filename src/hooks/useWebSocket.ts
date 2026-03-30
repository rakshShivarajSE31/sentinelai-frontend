import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { LiveEvent, Incident, WebSocketMessage } from '../types';

interface UseWebSocketReturn {
  isConnected: boolean;
  liveEvents: LiveEvent[];
  newIncidents: Incident[];
  clearNewIncidents: () => void;
}

const WS_URL = 'http://localhost:8080/ws';

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [newIncidents, setNewIncidents] = useState<Incident[]>([]);
  const clientRef = useRef<Client | null>(null);

  const clearNewIncidents = useCallback(() => {
    setNewIncidents([]);
  }, []);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,

      onConnect: () => {
        setIsConnected(true);
        console.log('WebSocket connected!');

        // Listen for live events
        client.subscribe('/topic/events', (message) => {
          const data: WebSocketMessage = JSON.parse(message.body);
          if (data.type === 'LIVE_EVENT') {
            const event: LiveEvent = {
              eventId: data.eventId,
              userId: data.userId,
              eventType: data.eventType,
              source: data.source,
              anomalyScore: data.anomalyScore,
              status: data.status,
              timestamp: data.timestamp
            };
            setLiveEvents(prev => [event, ...prev].slice(0, 50));
          }
        });

        // Listen for new incidents
        client.subscribe('/topic/incidents', (message) => {
          const data: WebSocketMessage = JSON.parse(message.body);
          if (data.type === 'NEW_INCIDENT') {
            const incident = data as unknown as Incident;
            setNewIncidents(prev => [incident, ...prev]);
          }
        });
      },

      onDisconnect: () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
      },

      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
        setIsConnected(false);
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  return { isConnected, liveEvents, newIncidents, clearNewIncidents };
};