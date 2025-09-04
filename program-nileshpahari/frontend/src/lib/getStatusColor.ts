
export const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-yellow text-black border-2 border-black"
      case "ended":
        return "bg-gray-300 text-black border-2 border-black"
      default:
        return "bg-blue text-white border-2 border-black"
    }
  }