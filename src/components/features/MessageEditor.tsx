import React from 'react';
import { XCircle, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface MessageEditorProps {
  messages: string[];
  onUpdate: (messages: string[]) => void;
}

export const MessageEditor: React.FC<MessageEditorProps> = ({ messages, onUpdate }) => {
  return (
    <div className="flex-shrink-0 flex flex-col h-full bg-gray-50/30">
       <div className="p-2 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase flex justify-between">
         <span>Message Sequence</span>
         <span>{messages.length} steps</span>
       </div>
       <div className="flex-1 overflow-y-auto p-3 space-y-3">
         {messages.map((msg, i) => (
           <div key={i} className="relative group">
             <div className="absolute -left-3 top-3 text-[10px] text-gray-300 font-bold w-4 text-right">{i+1}</div>
             <textarea 
               value={msg} 
               onChange={e => {
                 const m = [...messages]; m[i] = e.target.value;
                 onUpdate(m);
               }}
               className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-y"
               placeholder="User message..."
             />
             <button onClick={() => {
               const m = messages.filter((_, idx) => idx !== i);
               onUpdate(m);
             }} className="absolute top-1 right-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle className="w-4 h-4"/></button>
           </div>
         ))}
         <Button variant="outline" className="w-full border-dashed text-gray-400 hover:text-blue-600" onClick={() => onUpdate([...messages, ''])}>
           <Plus className="w-3 h-3 mr-2"/> Add Message
         </Button>
       </div>
    </div>
  );
};
