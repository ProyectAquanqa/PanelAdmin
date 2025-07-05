import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

const Modal = ({ isOpen, onClose, children, title, size = 'md' }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${sizeClasses[size]} transform rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col`}
              >
                {title && (
                    <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-200">
                        <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">
                        {title}
                        </Dialog.Title>
                    </div>
                )}
                <button
                  type="button"
                  className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-100"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                    {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal; 