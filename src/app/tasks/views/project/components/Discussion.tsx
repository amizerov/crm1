'use client';

import { useState, useEffect, useRef } from 'react';
import {
  getProjectMessages,
  addProjectMessage,
  updateProjectMessageText,
  deleteProjectMessage,
  deleteProjectMessageAttachment,
  ProjectMessage
} from '../actions/getMessages';
import { uploadProjectDocument } from '../actions/uploadDocument';

interface DiscussionProps {
  projectId: number;
  currentUserId: number;
  onMessagesChanged?: (messages: ProjectMessage[]) => void;
  onDocumentsChanged?: () => void;
}

interface DiscussionAttachment {
  name: string;
  path: string;
}

type FeedbackDialogVariant = 'danger' | 'warning' | 'info';

interface FeedbackDialogState {
  title: string;
  message: string;
  variant: FeedbackDialogVariant;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm?: () => void | Promise<void>;
}

const ATTACHMENT_PREFIX = '__PROJECT_ATTACHMENT__';

export default function Discussion({
  projectId,
  currentUserId,
  onMessagesChanged,
  onDocumentsChanged
}: DiscussionProps) {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [processingMessageId, setProcessingMessageId] = useState<number | null>(null);
  const [deletingAttachmentPath, setDeletingAttachmentPath] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackDialog, setFeedbackDialog] = useState<FeedbackDialogState | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesRef = useRef<ProjectMessage[]>([]);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    loadMessages();
  }, [projectId]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/projects/${projectId}/messages/stream`);
    const handleConnected = () => {
      console.info('Project discussion SSE connected', { projectId });
    };
    const handleMessagesChanged = () => {
      console.info('Project discussion SSE messages-changed', { projectId });
      void refreshMessages();
    };
    const handleError = (event: Event) => {
      console.warn('Project discussion SSE error', { projectId, event });
    };

    eventSource.addEventListener('connected', handleConnected);
    eventSource.addEventListener('messages-changed', handleMessagesChanged);
    eventSource.addEventListener('error', handleError);

    const intervalId = window.setInterval(() => {
      void pollMessages();
    }, 60000);

    return () => {
      eventSource.removeEventListener('connected', handleConnected);
      eventSource.removeEventListener('messages-changed', handleMessagesChanged);
      eventSource.removeEventListener('error', handleError);
      eventSource.close();
      window.clearInterval(intervalId);
    };
  }, [projectId]);

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus({ preventScroll: true });
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages, isLoading]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const messagesData = await getProjectMessages(projectId);
      applyMessages(messagesData);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyMessages = (updatedMessages: ProjectMessage[]) => {
    const currentMessages = messagesRef.current;
    const hasChanges =
      updatedMessages.length !== currentMessages.length ||
      updatedMessages.some((message, index) => {
        const currentMessage = currentMessages[index];

        return (
          !currentMessage ||
          message.id !== currentMessage.id ||
          message.description !== currentMessage.description ||
          message.dtc !== currentMessage.dtc ||
          message.dtu !== currentMessage.dtu
        );
      });

    if (!hasChanges) return;

    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    onMessagesChanged?.(updatedMessages);
  };

  const refreshMessages = async () => {
    try {
      const updatedMessages = await getProjectMessages(projectId);
      applyMessages(updatedMessages);
    } catch (error) {
      console.error('РћС€РёР±РєР° РѕР±РЅРѕРІР»РµРЅРёСЏ СЃРѕРѕР±С‰РµРЅРёР№:', error);
    }
  };

  const pollMessages = async () => {
    if (isRefreshingRef.current) return;

    try {
      isRefreshingRef.current = true;
      await refreshMessages();
    } finally {
      isRefreshingRef.current = false;
    }
  };

  const notifyProjectMessagesChanged = async () => {
    try {
      await fetch(`/api/projects/${projectId}/messages/stream`, {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Project discussion SSE notify failed', { projectId, error });
    }
  };

  const showErrorDialog = (message: string) => {
    setFeedbackDialog({
      title: 'Ошибка',
      message,
      variant: 'danger',
      confirmLabel: 'Понятно',
    });
  };

  const handleDialogConfirm = async () => {
    const confirmAction = feedbackDialog?.onConfirm;
    setFeedbackDialog(null);

    if (confirmAction) {
      await confirmAction();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || isSendingMessage) return;

    try {
      setIsSendingMessage(true);
      const uploadedAttachments: DiscussionAttachment[] = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadProjectDocument(projectId, formData);

        if (!result.success || !result.filePath || !result.originalName) {
          throw new Error(result.message || 'Ошибка загрузки файла');
        }

        uploadedAttachments.push({
          name: result.originalName,
          path: result.filePath,
        });
      }

      const attachmentLines = uploadedAttachments.map((attachment) => (
        `${ATTACHMENT_PREFIX}${JSON.stringify(attachment)}`
      ));
      const messageText = [
        newMessage.trim(),
        ...attachmentLines,
      ].filter(Boolean).join('\n');

      await addProjectMessage(projectId, messageText);
      setNewMessage('');
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      await refreshMessages();
      await notifyProjectMessagesChanged();
      if (uploadedAttachments.length > 0) {
        onDocumentsChanged?.();
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      showErrorDialog(error instanceof Error ? error.message : 'Ошибка отправки сообщения');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parseMessage = (description: string) => {
    const lines = description.split('\n');
    const textLines: string[] = [];
    const attachments: DiscussionAttachment[] = [];

    for (const line of lines) {
      if (line.startsWith(ATTACHMENT_PREFIX)) {
        try {
          attachments.push(JSON.parse(line.slice(ATTACHMENT_PREFIX.length)));
        } catch {
          textLines.push(line);
        }
      } else {
        textLines.push(line);
      }
    }

    return {
      text: textLines.join('\n').trim(),
      attachments,
    };
  };

  const startEditMessage = (message: ProjectMessage) => {
    const parsedMessage = parseMessage(message.description);
    setEditingMessageId(message.id);
    setEditingText(parsedMessage.text);
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleUpdateMessage = async (messageId: number) => {
    try {
      setProcessingMessageId(messageId);
      const result = await updateProjectMessageText(messageId, editingText);

      if (!result.success) {
        showErrorDialog(result.message || 'Ошибка редактирования сообщения');
        return;
      }

      cancelEditMessage();
      await refreshMessages();
      await notifyProjectMessagesChanged();
    } catch (error) {
      console.error('Ошибка редактирования сообщения:', error);
      showErrorDialog(error instanceof Error ? error.message : 'Ошибка редактирования сообщения');
    } finally {
      setProcessingMessageId(null);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    setFeedbackDialog({
      title: 'Удалить сообщение?',
      message: 'Прикрепленные к нему файлы тоже будут удалены.',
      variant: 'danger',
      confirmLabel: 'Удалить',
      cancelLabel: 'Отмена',
      onConfirm: () => deleteMessageConfirmed(messageId),
    });
  };

  const deleteMessageConfirmed = async (messageId: number) => {
    try {
      setProcessingMessageId(messageId);
      const result = await deleteProjectMessage(messageId);

      if (!result.success) {
        showErrorDialog(result.message || 'Ошибка удаления сообщения');
        return;
      }

      if (editingMessageId === messageId) {
        cancelEditMessage();
      }

      await refreshMessages();
      await notifyProjectMessagesChanged();
      onDocumentsChanged?.();
    } catch (error) {
      console.error('Ошибка удаления сообщения:', error);
      showErrorDialog(error instanceof Error ? error.message : 'Ошибка удаления сообщения');
    } finally {
      setProcessingMessageId(null);
    }
  };

  const handleDeleteAttachment = async (messageId: number, attachment: DiscussionAttachment) => {
    setFeedbackDialog({
      title: 'Удалить файл?',
      message: `"${attachment.name}" исчезнет из обсуждения и документов проекта.`,
      variant: 'danger',
      confirmLabel: 'Удалить',
      cancelLabel: 'Отмена',
      onConfirm: () => deleteAttachmentConfirmed(messageId, attachment),
    });
  };

  const deleteAttachmentConfirmed = async (messageId: number, attachment: DiscussionAttachment) => {
    try {
      setDeletingAttachmentPath(attachment.path);
      const result = await deleteProjectMessageAttachment(messageId, attachment.path);

      if (!result.success) {
        showErrorDialog(result.message || 'Ошибка удаления файла');
        return;
      }

      await refreshMessages();
      await notifyProjectMessagesChanged();
      onDocumentsChanged?.();
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
      showErrorDialog(error instanceof Error ? error.message : 'Ошибка удаления файла');
    } finally {
      setDeletingAttachmentPath(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Загрузка обсуждения...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Обсуждение проекта
        </h3>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div
          ref={messagesContainerRef}
          className="flex-1 min-h-0 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
        >
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-4">💬</div>
              <p>Сообщений пока нет</p>
              <p className="text-sm mt-2">Начните обсуждение проекта</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                (() => {
                  const parsedMessage = parseMessage(message.description);
                  const isOwnMessage = message.user_id === currentUserId;
                  const isEditing = editingMessageId === message.id;
                  const isProcessing = processingMessageId === message.id;

                  return (
                    <div key={message.id} className="flex space-x-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                          {(message.user_name || 'У').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {message.user_name || 'Пользователь'}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(message.dtc).toLocaleString('ru-RU')}
                            </span>
                            {message.dtu && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                изменено
                              </span>
                            )}
                          </div>
                          {isOwnMessage && !isEditing && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => startEditMessage(message)}
                                disabled={isProcessing}
                                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-300"
                                title="Редактировать"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(message.id)}
                                disabled={isProcessing}
                                className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                                title="Удалить"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        {isEditing ? (
                          <div className="mt-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              rows={3}
                              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                            />
                            <div className="mt-2 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEditMessage}
                                disabled={isProcessing}
                                className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                              >
                                Отмена
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateMessage(message.id)}
                                disabled={isProcessing}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                              >
                                Сохранить
                              </button>
                            </div>
                          </div>
                        ) : parsedMessage.text && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                            {parsedMessage.text}
                          </p>
                        )}
                        {parsedMessage.attachments.length > 0 && (
                          <div className="mt-2 flex flex-col gap-2">
                            {parsedMessage.attachments.map((attachment) => (
                              <div
                                key={`${attachment.path}-${attachment.name}`}
                                className="inline-flex w-fit max-w-full items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                              >
                                <a
                                  href={attachment.path}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex min-w-0 items-center gap-2"
                                >
                                  <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 00-5.657-5.657l-6.586 6.586a6 6 0 108.485 8.485L20 13" />
                                  </svg>
                                  <span className="truncate">{attachment.name}</span>
                                </a>
                                {isOwnMessage && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAttachment(message.id, attachment)}
                                    disabled={deletingAttachmentPath === attachment.path}
                                    className="ml-1 rounded p-0.5 text-blue-500 hover:bg-blue-200 hover:text-red-600 disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-900 dark:hover:text-red-300"
                                    title="Удалить файл"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Написать сообщение..."
                rows={3}
                ref={textareaRef}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <span
                      key={`${file.name}-${file.size}-${index}`}
                      className="inline-flex max-w-full items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                    >
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Убрать файл"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSendingMessage}
              className="h-10 w-10 flex-shrink-0 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              title="Прикрепить файл"
            >
              <svg className="mx-auto h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 00-5.657-5.657l-6.586 6.586a6 6 0 108.485 8.485L20 13" />
              </svg>
            </button>
            <button
              type="submit"
              disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSendingMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSendingMessage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                'Отправить'
              )}
            </button>
          </form>
        </div>
      </div>

      {feedbackDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex gap-4 p-5">
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${
                  feedbackDialog.variant === 'danger'
                    ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300'
                    : feedbackDialog.variant === 'warning'
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300'
                }`}
              >
                {feedbackDialog.variant === 'danger' ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 22a10 10 0 110-20 10 10 0 010 20z" />
                  </svg>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {feedbackDialog.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {feedbackDialog.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4 dark:border-gray-700">
              {feedbackDialog.cancelLabel && (
                <button
                  type="button"
                  onClick={() => setFeedbackDialog(null)}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  {feedbackDialog.cancelLabel}
                </button>
              )}
              <button
                type="button"
                onClick={handleDialogConfirm}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
                  feedbackDialog.variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : feedbackDialog.variant === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {feedbackDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
