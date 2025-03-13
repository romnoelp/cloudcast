import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const RecentSales = () => {
  const salesData = [
    { name: "Professor Jerry Jeremias", email: "jerry.jeremias@neu.edu.ph", amount: "3 months active", avatar: "", fallback: "" },
    { name: "Petracorta, Romnoel E.", email: "romnoel.petracorta@neu.edu.ph", amount: "5 months active", avatar: "", fallback: "JL" },
    { name: "Baltazar, Richmond A.", email: "richmond.baltazar@neu.edu.ph", amount: "2 months active", avatar: "", fallback: "IN" },
    { name: "De Leon, Erlyn Queen A.", email: "erlyn.deleon@neu.edu.ph", amount: "2 months active", avatar: "", fallback: "WK" },
    { name: "Pastores, Jabez Villan B.", email: "jabez.pastores@neu.edu.ph", amount: "1 month active", avatar: "", fallback: "SD" },
  ];

  return (
    <div className="space-y-8">
      {salesData.map((sale, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={sale.avatar} alt={sale.name} />
            <AvatarFallback>{sale.fallback}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.name}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className="ml-auto font-medium">{sale.amount}</div>
        </div>
      ))}
    </div>
  );
};

export default RecentSales;
