"use client";
import AddClass from "./AddClass";
import { EventProvider } from "../contexts/EventContext";

function Page() {
  return (
    <EventProvider>
      <AddClass />
    </EventProvider>
  );
}

export default Page;
