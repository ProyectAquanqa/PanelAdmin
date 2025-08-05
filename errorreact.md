react-dom.development.js:29895 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
EventosCategorias.jsx:214  Uncaught ReferenceError: filteredCategorias is not defined
    at EventosCategorias (EventosCategorias.jsx:214:23)
    at renderWithHooks (react-dom.development.js:15486:18)
    at updateFunctionComponent (react-dom.development.js:19617:20)
    at mountLazyComponent (react-dom.development.js:19988:17)
    at beginWork (react-dom.development.js:21632:16)
    at HTMLUnknownElement.callCallback2 (react-dom.development.js:4164:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:16)
    at invokeGuardedCallback (react-dom.development.js:4277:31)
    at beginWork$1 (react-dom.development.js:27490:7)
    at performUnitOfWork (react-dom.development.js:26596:12)
EventosCategorias @ EventosCategorias.jsx:214
renderWithHooks @ react-dom.development.js:15486
updateFunctionComponent @ react-dom.development.js:19617
mountLazyComponent @ react-dom.development.js:19988
beginWork @ react-dom.development.js:21632
callCallback2 @ react-dom.development.js:4164
invokeGuardedCallbackDev @ react-dom.development.js:4213
invokeGuardedCallback @ react-dom.development.js:4277
beginWork$1 @ react-dom.development.js:27490
performUnitOfWork @ react-dom.development.js:26596
workLoopConcurrent @ react-dom.development.js:26582
renderRootConcurrent @ react-dom.development.js:26544
performConcurrentWorkOnRoot @ react-dom.development.js:25777
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
EventosCategorias.jsx:214  Uncaught ReferenceError: filteredCategorias is not defined
    at EventosCategorias (EventosCategorias.jsx:214:23)
    at renderWithHooks (react-dom.development.js:15486:18)
    at updateFunctionComponent (react-dom.development.js:19617:20)
    at mountLazyComponent (react-dom.development.js:19988:17)
    at beginWork (react-dom.development.js:21632:16)
    at HTMLUnknownElement.callCallback2 (react-dom.development.js:4164:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:16)
    at invokeGuardedCallback (react-dom.development.js:4277:31)
    at beginWork$1 (react-dom.development.js:27490:7)
    at performUnitOfWork (react-dom.development.js:26596:12)
EventosCategorias @ EventosCategorias.jsx:214
renderWithHooks @ react-dom.development.js:15486
updateFunctionComponent @ react-dom.development.js:19617
mountLazyComponent @ react-dom.development.js:19988
beginWork @ react-dom.development.js:21632
callCallback2 @ react-dom.development.js:4164
invokeGuardedCallbackDev @ react-dom.development.js:4213
invokeGuardedCallback @ react-dom.development.js:4277
beginWork$1 @ react-dom.development.js:27490
performUnitOfWork @ react-dom.development.js:26596
workLoopSync @ react-dom.development.js:26505
renderRootSync @ react-dom.development.js:26473
recoverFromConcurrentError @ react-dom.development.js:25889
performConcurrentWorkOnRoot @ react-dom.development.js:25789
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
react-dom.development.js:18704  The above error occurred in the <EventosCategorias> component:

    at EventosCategorias (http://localhost:5173/src/pages/Eventos/EventosCategorias.jsx?t=1754423795067:38:7)
    at Suspense
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=5e328eb2:5455:26)
    at Outlet (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=5e328eb2:6122:26)
    at div
    at main
    at div
    at div
    at AdminLayout (http://localhost:5173/src/components/Layout/AdminLayout.jsx?t=1754422126966:24:57)
    at RequireAuth (http://localhost:5173/src/routes/AppRoutes.jsx?t=1754423795067:111:24)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=5e328eb2:5455:26)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=5e328eb2:6188:3)
    at AppRoutes
    at AuthProvider (http://localhost:5173/src/context/AuthContext.jsx:22:32)
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=5e328eb2:6131:13)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=5e328eb2:9149:3)
    at App (http://localhost:5173/src/App.jsx?t=1754423795067:26:3)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
logCapturedError @ react-dom.development.js:18704
update.callback @ react-dom.development.js:18737
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23430
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
react-dom.development.js:26962  Uncaught ReferenceError: filteredCategorias is not defined
    at EventosCategorias (EventosCategorias.jsx:214:23)
    at renderWithHooks (react-dom.development.js:15486:18)
    at updateFunctionComponent (react-dom.development.js:19617:20)
    at mountLazyComponent (react-dom.development.js:19988:17)
    at beginWork (react-dom.development.js:21632:16)
    at beginWork$1 (react-dom.development.js:27465:14)
    at performUnitOfWork (react-dom.development.js:26596:12)
    at workLoopSync (react-dom.development.js:26505:5)
    at renderRootSync (react-dom.development.js:26473:7)
    at recoverFromConcurrentError (react-dom.development.js:25889:20)
EventosCategorias @ EventosCategorias.jsx:214
renderWithHooks @ react-dom.development.js:15486
updateFunctionComponent @ react-dom.development.js:19617
mountLazyComponent @ react-dom.development.js:19988
beginWork @ react-dom.development.js:21632
beginWork$1 @ react-dom.development.js:27465
performUnitOfWork @ react-dom.development.js:26596
workLoopSync @ react-dom.development.js:26505
renderRootSync @ react-dom.development.js:26473
recoverFromConcurrentError @ react-dom.development.js:25889
performConcurrentWorkOnRoot @ react-dom.development.js:25789
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
[NEW] Explain Console errors by using Copilot in Edge: click
         
         to explain an error. 
        Learn more
        Don't show again
