import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Send, Mic, MicOff, Image as ImageIcon, Phone, Video, PhoneOff,
  VideoOff, X, ArrowLeft, Stethoscope, Play, Pause, Loader2
} from "lucide-react";

type Message = {
  id: string;
  consultation_id: string;
  sender_id: string;
  content: string | null;
  message_type: "text" | "image" | "voice_note" | "system";
  media_url: string | null;
  created_at: string;
  sender?: { full_name: string };
};

type CallState = "idle" | "calling" | "receiving" | "in_call";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const Consultation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [consultation, setConsultation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Audio playback tracking
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // WebRTC
  const [callState, setCallState] = useState<CallState>("idle");
  const [callType, setCallType] = useState<"voice" | "video">("video");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const channelRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    init();
    return () => {
      channelRef.current?.unsubscribe();
      endCall();
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const init = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) { navigate("/auth"); return; }
    setUser(u);

    const { data: consult } = await supabase
      .from("consultations")
      .select("*, hospital:hospital_id(name)")
      .eq("id", id)
      .single() as { data: any };

    if (consult) {
      // Fetch patient and doctor profiles separately
      const [patientRes, doctorRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name").eq("id", consult.patient_id).single(),
        supabase.from("profiles").select("id, full_name").eq("id", consult.doctor_id).single(),
      ]);
      const { data: docProfile } = await supabase.from("doctor_profiles").select("specialization").eq("id", consult.doctor_id).single();
      consult.patient = patientRes.data;
      consult.doctor = { ...doctorRes.data, doctor_profiles: docProfile ? [docProfile] : [] };
    }

    if (!consult) { navigate(-1); return; }
    setConsultation(consult);

    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("consultation_id", id)
      .order("created_at", { ascending: true });

    // Fetch sender names separately since no FK exists
    const typedMsgs: Message[] = [];
    if (msgs) {
      const senderIds = [...new Set(msgs.map(m => m.sender_id))];
      const { data: senders } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", senderIds);
      const senderMap = new Map(senders?.map(s => [s.id, s.full_name]) || []);
      for (const m of msgs) {
        typedMsgs.push({
          ...m,
          message_type: m.message_type as Message["message_type"],
          sender: { full_name: senderMap.get(m.sender_id) || "Unknown" },
        });
      }
    }
    setMessages(typedMsgs);
    setLoading(false);

    // Subscribe to real-time messages + call signals
    const channel = supabase
      .channel(`consultation:${id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `consultation_id=eq.${id}`,
      }, async (payload) => {
        const newMsg = payload.new as Message;
        // Fetch sender name
        const { data: sender } = await supabase
          .from("profiles").select("full_name").eq("id", newMsg.sender_id).single();
        setMessages((prev) => [...prev, { ...newMsg, sender: sender || undefined }]);

        // Handle call signaling messages
        if (newMsg.message_type === "system" && newMsg.content?.startsWith("__call__")) {
          handleCallSignal(JSON.parse(newMsg.content.replace("__call__", "")), newMsg.sender_id, u.id);
        }
      })
      .subscribe();

    channelRef.current = channel;
  };

  const sendMessage = async (type: Message["message_type"], content?: string, mediaUrl?: string) => {
    if (!user || !id) return;
    const { error } = await supabase.from("messages").insert({
      consultation_id: id,
      sender_id: user.id,
      content: content || null,
      message_type: type,
      media_url: mediaUrl || null,
    });
    if (error) throw error;
  };

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage("text", text.trim());
      setText("");
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `consultations/${id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("medical-files")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("medical-files").getPublicUrl(path);
      await sendMessage("image", null, publicUrl);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await uploadVoiceNote(blob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast({ title: "Microphone access denied", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const uploadVoiceNote = async (blob: Blob) => {
    setUploading(true);
    try {
      const path = `consultations/${id}/voice_${Date.now()}.webm`;
      const { error } = await supabase.storage.from("medical-files").upload(path, blob);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("medical-files").getPublicUrl(path);
      await sendMessage("voice_note", null, publicUrl);
    } catch (err: any) {
      toast({ title: "Voice upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const toggleAudio = (msgId: string, url: string) => {
    if (playingId === msgId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = url;
      } else {
        audioRef.current = new Audio(url);
        audioRef.current.onended = () => setPlayingId(null);
      }
      audioRef.current.src = url;
      audioRef.current.play().catch(() => {});
      setPlayingId(msgId);
    }
  };

  // --- WebRTC ---
  const setupPeerConnection = () => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.ontrack = (e) => setRemoteStream(e.streams[0]);
    pc.onicecandidate = (e) => {
      if (e.candidate) sendCallSignal({ type: "ice", candidate: e.candidate });
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        endCall();
      }
    };
    peerConnectionRef.current = pc;
    return pc;
  };

  const startCall = async (type: "voice" | "video") => {
    setCallType(type);
    setCallState("calling");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
      setLocalStream(stream);
      const pc = setupPeerConnection();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendCallSignal({ type: "offer", sdp: offer, callType: type });
    } catch (err: any) {
      toast({ title: "Could not start call", description: err.message, variant: "destructive" });
      setCallState("idle");
    }
  };

  const answerCall = async (offer: RTCSessionDescriptionInit, cType: "voice" | "video") => {
    setCallType(cType);
    setCallState("in_call");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: cType === "video",
      });
      setLocalStream(stream);
      const pc = setupPeerConnection();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendCallSignal({ type: "answer", sdp: answer });
    } catch (err: any) {
      toast({ title: "Could not answer call", description: err.message, variant: "destructive" });
      setCallState("idle");
    }
  };

  const handleCallSignal = async (signal: any, senderId: string, currentUserId: string) => {
    if (senderId === currentUserId) return;
    const pc = peerConnectionRef.current;

    if (signal.type === "offer") {
      setCallState("receiving");
      setCallType(signal.callType || "video");
      setTimeout(() => answerCall(signal.sdp, signal.callType || "video"), 0);
    } else if (signal.type === "answer" && pc) {
      await pc.setRemoteDescription(signal.sdp);
      setCallState("in_call");
    } else if (signal.type === "ice" && pc) {
      try { await pc.addIceCandidate(signal.candidate); } catch {}
    } else if (signal.type === "end") {
      endCall();
    }
  };

  const sendCallSignal = async (signal: object) => {
    await supabase.from("messages").insert({
      consultation_id: id,
      sender_id: user.id,
      content: `__call__${JSON.stringify(signal)}`,
      message_type: "system",
      media_url: null,
    });
  };

  const endCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setCallState("idle");
  }, [localStream]);

  const handleEndCall = () => {
    sendCallSignal({ type: "end" });
    endCall();
  };

  const isDoctor = user?.id === consultation?.doctor?.id;
  const otherPerson = isDoctor ? consultation?.patient : consultation?.doctor;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="w-9 h-9 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {otherPerson?.full_name?.[0] || "?"}
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">
              {isDoctor ? otherPerson?.full_name : `Dr. ${otherPerson?.full_name}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {!isDoctor && consultation?.doctor?.doctor_profiles?.[0]?.specialization}
              {consultation?.hospital?.name && ` · ${consultation.hospital.name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant={consultation?.status === "active" ? "default" : "secondary"} className="text-xs mr-2">
            {consultation?.status}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => startCall("voice")}
            disabled={callState !== "idle"}
            title="Voice call"
            data-testid="button-voice-call"
          >
            <Phone className="h-4 w-4 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => startCall("video")}
            disabled={callState !== "idle"}
            title="Video call"
            data-testid="button-video-call"
          >
            <Video className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </header>

      {/* Video call overlay */}
      {callState !== "idle" && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center gap-6">
          {callType === "video" && (
            <div className="relative w-full max-w-2xl">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-xl bg-black" />
              <video
                ref={localVideoRef}
                autoPlay playsInline muted
                className="absolute bottom-3 right-3 w-32 h-24 rounded-lg bg-gray-800 object-cover"
              />
            </div>
          )}
          {callType === "voice" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-gradient-hero rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {otherPerson?.full_name?.[0] || "?"}
              </div>
              <p className="text-white text-xl font-semibold">
                {isDoctor ? otherPerson?.full_name : `Dr. ${otherPerson?.full_name}`}
              </p>
              <p className="text-white/70">
                {callState === "calling" ? "Calling..." : callState === "receiving" ? "Connecting..." : "In call"}
              </p>
            </div>
          )}
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={handleEndCall}
            data-testid="button-end-call"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {consultation?.chief_complaint && (
          <div className="text-center">
            <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
              Complaint: {consultation.chief_complaint}
            </span>
          </div>
        )}
        {messages
          .filter((m) => !m.content?.startsWith("__call__"))
          .map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            const isSystem = msg.message_type === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center">
                  <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] space-y-1 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                  {!isOwn && (
                    <span className="text-xs text-muted-foreground px-1">{msg.sender?.full_name}</span>
                  )}
                  <div className={`rounded-2xl px-4 py-2.5 ${isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm"}`}>
                    {msg.message_type === "text" && (
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    )}
                    {msg.message_type === "image" && msg.media_url && (
                      <img
                        src={msg.media_url}
                        alt="Shared image"
                        className="max-w-full rounded-lg max-h-60 object-cover cursor-pointer"
                        onClick={() => window.open(msg.media_url!, "_blank")}
                      />
                    )}
                    {msg.message_type === "voice_note" && msg.media_url && (
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`w-8 h-8 rounded-full flex-shrink-0 ${isOwn ? "text-primary-foreground hover:bg-white/20" : ""}`}
                          onClick={() => toggleAudio(msg.id, msg.media_url!)}
                          data-testid={`button-play-voice-${msg.id}`}
                        >
                          {playingId === msg.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <div className={`flex-1 h-1 rounded-full ${isOwn ? "bg-white/40" : "bg-border"}`}>
                          <div className={`h-full w-1/3 rounded-full ${isOwn ? "bg-white" : "bg-primary"}`} />
                        </div>
                        <span className={`text-xs flex-shrink-0 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          Voice note
                        </span>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs text-muted-foreground px-1`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex-shrink-0">
        <div className="flex items-end gap-2">
          {/* Image upload */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-10 w-10"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Send image"
            data-testid="button-send-image"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          </Button>

          {/* Voice note */}
          <Button
            variant={recording ? "destructive" : "ghost"}
            size="icon"
            className="flex-shrink-0 h-10 w-10"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            title={recording ? "Release to send" : "Hold to record voice note"}
            data-testid="button-voice-note"
          >
            {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 min-h-[40px] max-h-32 resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            data-testid="input-message"
          />

          <Button
            size="icon"
            className="flex-shrink-0 h-10 w-10"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            data-testid="button-send"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {recording && (
          <p className="text-xs text-destructive text-center mt-2 animate-pulse">🔴 Recording... release to send</p>
        )}
      </div>
    </div>
  );
};

export default Consultation;
