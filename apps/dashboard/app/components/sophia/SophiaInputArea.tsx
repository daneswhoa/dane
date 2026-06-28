import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Square, Paperclip, Camera, Image, Volume2, FileSpreadsheet, TrendingUp, Wrench } from 'lucide-react';

interface SophiaInputAreaProps {
  apiBase: string;
  isTyping: boolean;
  onSendMessage: (msg: string, audioData?: { base64Data: string; mimeType: string; duration: number }, photoUrl?: string) => void;
  onStopSophia: () => void;
  setErrorModal: (title: string, message: string, stack: string) => void;
  isDragOver: boolean;
  setIsDragOver: (drag: boolean) => void;
}

export default function SophiaInputArea({
  apiBase,
  isTyping,
  onSendMessage,
  onStopSophia,
  setErrorModal,
  isDragOver,
  setIsDragOver
}: SophiaInputAreaProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voicePermissionGranted, setVoicePermissionGranted] = useState(false);
  const [showMicModal, setShowMicModal] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<{ base64Data: string; mimeType: string; blobUrl: string } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // Close attachment menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setShowAttachmentMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Timer clean up
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${apiBase}/api/dashboard/properties/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (data.success && data.photoUrl) {
        setUploadedImageUrl(data.photoUrl);
      } else {
        throw new Error('Server returned unsuccessful upload');
      }
    } catch (err: any) {
      setErrorModal(
        'Upload Error',
        err.message || 'Failed to upload the cover photo.',
        'Code: FILE_UPLOAD_FAIL\nStatus: Error returned by upload controller.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const validateImageHeader = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        if (!e.target || !e.target.result) {
          resolve(false);
          return;
        }
        const arr = new Uint8Array(e.target.result as ArrayBuffer);
        if (arr.length < 4) {
          resolve(false);
          return;
        }
        // PNG
        if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) {
          resolve(true);
          return;
        }
        // JPG / JPEG
        if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) {
          resolve(true);
          return;
        }
        // GIF
        if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38) {
          resolve(true);
          return;
        }
        // WEBP
        if (arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46) {
          resolve(true);
          return;
        }
        resolve(false);
      };
      reader.readAsArrayBuffer(file.slice(0, 12));
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const isValid = await validateImageHeader(file);
      if (!isValid) {
        setErrorModal(
          'Invalid Image File',
          'The uploaded file is not a valid image format (JPEG, PNG, GIF, WEBP). Verification failed.',
          'Code: VALIDATION_FILE_SIGNATURE_MISMATCH\nStatus: Magic numbers check failed.'
        );
        e.target.value = '';
        return;
      }
      await handleUploadFile(file);
      e.target.value = '';
    }
  };

  const handleMicClick = async () => {
    if (voicePermissionGranted) {
      startRecording();
    } else {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorModal(
          'Microphone Access Error',
          'Microphone access is not supported by your browser or connection environment.',
          ''
        );
        return;
      }
      setShowMicModal(true);
    }
  };

  const handleAllowMic = async () => {
    setShowMicModal(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setVoicePermissionGranted(true);
      setTimeout(() => {
        startRecording();
      }, 200);
    } catch (err: any) {
      setErrorModal(
        'Permission Denied',
        'Microphone permission request was rejected. Please check browser settings.',
        ''
      );
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(audioBlob);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1];
          setRecordedAudio({
            base64Data,
            mimeType: 'audio/webm',
            blobUrl
          });
        };
        stream.getTracks().forEach(track => track.stop());
      };

      setRecordingSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const submitSendMessage = (text: string) => {
    const finalMsg = text.trim();
    if (!finalMsg && !recordedAudio && !uploadedImageUrl) return;

    if (recordedAudio) {
      onSendMessage('', {
        base64Data: recordedAudio.base64Data,
        mimeType: recordedAudio.mimeType,
        duration: recordingSeconds
      }, uploadedImageUrl || undefined);
      URL.revokeObjectURL(recordedAudio.blobUrl);
      setRecordedAudio(null);
    } else {
      onSendMessage(finalMsg, undefined, uploadedImageUrl || undefined);
    }

    setInputValue('');
    setUploadedImageUrl(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isTyping) {
      submitSendMessage(inputValue);
    }
  };

  return (
    <div className="p-4 border-t border-paper-200/50 dark:border-ink-800/50 bg-paper-50 dark:bg-ink-900 pb-6 z-20">
      {/* Suggestions */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar px-1 max-w-4xl mx-auto">
        <button 
          onClick={() => submitSendMessage("Show my portfolio metrics summary")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 hover:border-coral-300 dark:hover:border-coral-500/50 hover:text-coral-650 dark:hover:text-coral-400 active:scale-95 transition-all whitespace-nowrap shadow-sm font-mono"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> View Portfolio Summary
        </button>
        <button 
          onClick={() => submitSendMessage("Calculate: 2500 * 12 - (450 * 6)")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 hover:border-coral-300 dark:hover:border-coral-500/50 hover:text-coral-650 dark:hover:text-coral-400 active:scale-95 transition-all whitespace-nowrap shadow-sm font-mono"
        >
          <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Lease Calculator
        </button>
        <button 
          onClick={() => submitSendMessage("Show donut-chart of property shares and table of arrears")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 text-paper-700 dark:text-ink-200 hover:border-coral-300 dark:hover:border-coral-500/50 hover:text-coral-650 dark:hover:text-coral-400 active:scale-95 transition-all whitespace-nowrap shadow-sm font-mono"
        >
          <Wrench className="w-3.5 h-3.5 text-purple-500" /> Analyze Rent Shares
        </button>
      </div>

      {/* Image Preview Container */}
      {(isUploading || uploadedImageUrl) && (
        <div className="max-w-4xl mx-auto mb-3 bg-white dark:bg-ink-800 border border-paper-200/50 dark:border-ink-700/50 rounded-xl p-3 flex items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            {isUploading ? (
              <div className="w-10 h-10 rounded bg-paper-100 dark:bg-ink-900 flex items-center justify-center animate-pulse">
                <span className="w-4 h-4 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <img src={uploadedImageUrl!} alt="Attached preview" className="w-10 h-10 object-cover rounded border border-paper-200 dark:border-ink-700" />
            )}
            <div>
              <p className="text-xs font-semibold text-paper-900 dark:text-white">
                {isUploading ? 'Uploading cover photo...' : 'Cover photo ready'}
              </p>
              <p className="text-[10px] text-paper-400 truncate max-w-[250px]">
                {isUploading ? 'Sending file to secure server...' : uploadedImageUrl}
              </p>
            </div>
          </div>
          {!isUploading && (
            <button 
              onClick={() => setUploadedImageUrl(null)}
              className="px-2.5 py-1 hover:bg-paper-100 dark:hover:bg-ink-900 text-coral-500 hover:text-coral-600 rounded text-xs font-semibold transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Voice Preview Container */}
      {recordedAudio && (
        <div className="max-w-4xl mx-auto mb-3 bg-white dark:bg-ink-800 border border-paper-200/50 dark:border-ink-700/50 rounded-xl p-3 flex items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-coral-500/10 text-coral-500 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-paper-900 dark:text-white uppercase tracking-wider font-mono">Spoken Request Preview</p>
              <div className="mt-1">
                <audio src={recordedAudio.blobUrl} controls className="h-7 w-full max-w-[280px] focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                URL.revokeObjectURL(recordedAudio.blobUrl);
                setRecordedAudio(null);
              }}
              className="px-2.5 py-1.5 border border-paper-250 dark:border-ink-750 text-paper-505 hover:text-paper-605 rounded text-xs font-semibold transition-all hover:bg-paper-100 dark:hover:bg-ink-900"
            >
              Discard
            </button>
            <button 
              onClick={() => submitSendMessage('')}
              className="px-2.5 py-1.5 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded text-xs font-semibold transition-all hover:opacity-90 active:scale-95 shadow-sm shadow-coral-500/20"
            >
              Send Voice
            </button>
          </div>
        </div>
      )}

      {/* Command Input Field */}
      <div className="relative rounded-xl bg-gradient-to-r from-coral-500 via-coral-400 to-coral-500 p-[1px] shadow-md shadow-coral-500/5 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-ink-800 flex items-center p-1.5 rounded-xl transition-all duration-300">
          <div className="relative" ref={attachmentMenuRef}>
            <button 
              onClick={() => {
                if (!isTyping && !isRecording && !recordedAudio) {
                  setShowAttachmentMenu(!showAttachmentMenu);
                }
              }}
              disabled={isTyping || isRecording || !!recordedAudio}
              className={`p-2 transition-all rounded-md ${
                isTyping || isRecording || recordedAudio
                  ? 'text-paper-200 dark:text-ink-700 cursor-not-allowed'
                  : 'text-paper-400 hover:text-paper-700 dark:text-ink-400 dark:hover:text-ink-200'
              }`}
              title="Attach image source"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {showAttachmentMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-40 bg-white dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-xl shadow-xl py-1.5 z-30 animate-fade-in">
                <button 
                  onClick={() => {
                    setShowAttachmentMenu(false);
                    cameraInputRef.current?.click();
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-paper-705 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-ink-909 flex items-center gap-2 transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-coral-500" />
                  Take Photo
                </button>
                <button 
                  onClick={() => {
                    setShowAttachmentMenu(false);
                    galleryInputRef.current?.click();
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-paper-705 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-ink-909 flex items-center gap-2 transition-all"
                >
                  <Image className="w-3.5 h-3.5 text-blue-500" />
                  Upload Image
                </button>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={galleryInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {isRecording ? (
            <div className="flex-1 px-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-semibold text-paper-600 dark:text-ink-300">
                  Listening... ({formatTime(recordingSeconds)})
                </span>
              </div>
              <div className="flex items-center gap-[3px] h-3">
                <div className="w-[3px] bg-red-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite_100ms] h-1.5"></div>
                <div className="w-[3px] bg-red-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite_200ms] h-3.5"></div>
                <div className="w-[3px] bg-red-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite_300ms] h-2"></div>
                <div className="w-[3px] bg-red-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite_400ms] h-1.5"></div>
                <div className="w-[3px] bg-red-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite_500ms] h-3"></div>
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isTyping 
                  ? "Sophia is thinking/answering..." 
                  : recordedAudio 
                  ? "Spoken request ready to send..." 
                  : "Ask Sophia to analyze data, draft documents, or automate tasks..."
              } 
              disabled={isTyping || !!recordedAudio}
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm px-2 text-paper-900 dark:text-white placeholder-paper-400 dark:placeholder-ink-500 font-sans"
            />
          )}

          <button 
            onClick={isRecording ? stopRecording : handleMicClick}
            disabled={isTyping || !!recordedAudio}
            className={`p-2 transition-all rounded-md mr-1 ${
              isRecording 
                ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20 animate-pulse' 
                : (isTyping || recordedAudio)
                ? 'text-paper-200 dark:text-ink-700 cursor-not-allowed'
                : 'text-paper-400 hover:text-paper-700 dark:text-ink-400 dark:hover:text-ink-200'
            }`}
            title={isRecording ? 'Stop Recording' : 'Record voice instruction'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {isTyping ? (
            <button 
              onClick={onStopSophia}
              className="p-2 bg-red-500 hover:bg-red-650 text-white rounded-lg active:scale-95 transition-all flex items-center justify-center"
              title="Stop generation"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button 
              onClick={() => submitSendMessage(inputValue)}
              disabled={isRecording || (!inputValue.trim() && !recordedAudio) || (!!recordedAudio && isRecording)}
              className={`p-2 rounded-lg active:scale-95 transition-all flex items-center justify-center group ${
                isRecording || (!inputValue.trim() && !recordedAudio)
                  ? 'bg-paper-200 text-paper-400 dark:bg-ink-750 dark:text-ink-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:opacity-90 shadow-sm shadow-coral-500/20'
              }`}
            >
              <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      <div className="text-center mt-2.5">
        <span className="text-[9px] text-paper-400 dark:text-ink-500 font-sans">Sophia AI operations are logged. Verification is recommended on financial actions.</span>
      </div>

      {showMicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white/90 dark:bg-ink-950/90 backdrop-blur-md border border-paper-200/50 dark:border-ink-800/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-coral-500/10 text-coral-500 flex items-center justify-center animate-bounce">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-paper-900 dark:text-white uppercase tracking-wider font-mono">Microphone Access Required</h3>
              <p className="text-xs text-paper-550 dark:text-ink-400 mt-2 leading-relaxed">
                Sophia can hear and execute verbal commands natively using Gemini. Allow microphone access to enable voice input.
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button 
                onClick={() => setShowMicModal(false)}
                className="flex-1 px-4 py-2 border border-paper-200 dark:border-ink-800 rounded-xl text-xs font-semibold text-paper-700 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-909 active:scale-95 transition-all"
              >
                Not Now
              </button>
              <button 
                onClick={handleAllowMic}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-coral-500/20"
              >
                Allow & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
