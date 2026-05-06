"use client";

import { useEffect, useRef } from "react";

export const LIVE_UPDATE_EVENT = "finance-live-update";

const resourceAliasMap = {
  incomeCategories: "categories",
  expenseCategories: "categories",
  income: "transactions",
  expenses: "transactions",
};

export function normalizeLiveResource(resource) {
  return resourceAliasMap[resource] || resource;
}

export function eventMatchesResources(event, resources) {
  const normalizedResources = resources.map(normalizeLiveResource);
  const eventResources = (event?.resources || []).map(normalizeLiveResource);
  return eventResources.some((resource) => normalizedResources.includes(resource));
}

export function useLiveUpdateListener(resources, callback) {
  const callbackRef = useRef(callback);
  const resourcesKey = JSON.stringify((resources || []).map(normalizeLiveResource).sort());

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const resourceList = JSON.parse(resourcesKey);
    if (!resourceList.length) {
      return undefined;
    }

    function handleEvent(browserEvent) {
      const payload = browserEvent.detail;
      if (eventMatchesResources(payload, resourceList)) {
        callbackRef.current?.(payload);
      }
    }

    window.addEventListener(LIVE_UPDATE_EVENT, handleEvent);
    return () => {
      window.removeEventListener(LIVE_UPDATE_EVENT, handleEvent);
    };
  }, [resourcesKey]);
}
