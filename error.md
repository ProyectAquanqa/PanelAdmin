react-dom.development.js:29895 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
CategoryModal.jsx:109  Uncaught ReferenceError: getCheckboxProps is not defined
    at CategoryModal (CategoryModal.jsx:109:15)
    at renderWithHooks (react-dom.development.js:15486:18)
    at updateFunctionComponent (react-dom.development.js:19617:20)
    at beginWork (react-dom.development.js:21640:16)
    at HTMLUnknownElement.callCallback2 (react-dom.development.js:4164:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:16)
    at invokeGuardedCallback (react-dom.development.js:4277:31)
    at beginWork$1 (react-dom.development.js:27490:7)
    at performUnitOfWork (react-dom.development.js:26596:12)
    at workLoopSync (react-dom.development.js:26505:5)
CategoryModal.jsx:109  Uncaught ReferenceError: getCheckboxProps is not defined
    at CategoryModal (CategoryModal.jsx:109:15)
    at renderWithHooks (react-dom.development.js:15486:18)
    at updateFunctionComponent (react-dom.development.js:19617:20)
    at beginWork (react-dom.development.js:21640:16)
    at HTMLUnknownElement.callCallback2 (react-dom.development.js:4164:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:16)
    at invokeGuardedCallback (react-dom.development.js:4277:31)
    at beginWork$1 (react-dom.development.js:27490:7)
    at performUnitOfWork (react-dom.development.js:26596:12)
    at workLoopSync (react-dom.development.js:26505:5)
react-dom.development.js:18704  The above error occurred in the <CategoryModal> component:

    at CategoryModal (http://localhost:5173/src/components/Chatbot/Categories/CategoryModal.jsx?t=1753967658388:22:3)
    at div
    at Categories (http://localhost:5173/src/pages/Chatbot/Categories.jsx?t=1753967658388:35:7)
    at Suspense
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=d3298904:5455:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=d3298904:6122:26)
    at div
    at main
    at div
    at div
    at AdminLayout (http://localhost:5173/src/components/Layout/AdminLayout.jsx:24:57)
    at RequireAuth (http://localhost:5173/src/routes/AppRoutes.jsx?t=1753967658388:101:24)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=d3298904:5455:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=d3298904:6188:3)
    at AppRoutes
    at AuthProvider (http://localhost:5173/src/context/AuthContext.jsx:22:32)
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=d3298904:6131:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=d3298904:9149:3)
    at App (http://localhost:5173/src/App.jsx?t=1753967658388:26:3)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
logCapturedError @ react-dom.development.js:18704
react-dom.development.js:12056  Uncaught ReferenceError: getCheckboxProps is not defined
    at CategoryModal (CategoryModal.jsx:109:15)
    at renderWithHooks (react-dom.development.js:15486:18)
    at updateFunctionComponent (react-dom.development.js:19617:20)
    at beginWork (react-dom.development.js:21640:16)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12)
    at workLoopSync (react-dom.development.js:26505:5)
    at renderRootSync (react-dom.development.js:26473:7)
    at recoverFromConcurrentError (react-dom.development.js:25889:20)
    at performSyncWorkOnRoot (react-dom.development.js:26135:20)
