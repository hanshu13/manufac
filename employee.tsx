interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

interface IEmployeeOrgApp {
  ceo: Employee;
  move(employeeID: number, supervisorID: number): void;
  undo(): void;
  redo(): void;
}

class EmployeeOrgApp implements IEmployeeOrgApp {
  private history: {
    employeeID: number;
    fromSupervisorID: number;
    toSupervisorID: number;
  }[];
  private employeeMap: Map<number, Employee>;

  constructor(public ceo: Employee) {
    this.history = [];
    this.employeeMap = new Map();
    this.buildEmployeeMap(ceo);
  }

  private buildEmployeeMap(employee: Employee): void {
    this.employeeMap.set(employee.uniqueId, employee);
    employee.subordinates.forEach((subordinate) =>
      this.buildEmployeeMap(subordinate)
    );
  }

  private findEmployeeByID(employeeID: number): Employee | undefined {
    return this.employeeMap.get(employeeID);
  }

  private removeEmployeeFromSupervisor(
    employee: Employee,
    supervisor: Employee
  ): void {
    supervisor.subordinates = supervisor.subordinates.filter(
      (subordinate) => subordinate.uniqueId !== employee.uniqueId
    );
  }

  private addEmployeeToSupervisor(
    employee: Employee,
    supervisor: Employee
  ): void {
    supervisor.subordinates.push(employee);
  }

  move(employeeID: number, supervisorID: number): void {
    const employee = this.findEmployeeByID(employeeID);
    const fromSupervisor = this.findEmployeeByID(
      this.history[this.history.length - 1]?.toSupervisorID || employeeID
    );
    const toSupervisor = this.findEmployeeByID(supervisorID);

    if (!employee || !fromSupervisor || !toSupervisor) {
      throw new Error("Invalid employee or supervisor ID");
    }

    this.removeEmployeeFromSupervisor(employee, fromSupervisor);
    this.addEmployeeToSupervisor(employee, toSupervisor);

    this.history.push({
      employeeID,
      fromSupervisorID: fromSupervisor.uniqueId,
      toSupervisorID: toSupervisor.uniqueId,
    });
  }

  undo(): void {
    const lastMove = this.history.pop();
    if (!lastMove) {
      throw new Error("No moves to undo");
    }

    const { employeeID, fromSupervisorID, toSupervisorID } = lastMove;
    const employee = this.findEmployeeByID(employeeID);
    const fromSupervisor = this.findEmployeeByID(fromSupervisorID);
    const toSupervisor = this.findEmployeeByID(toSupervisorID);

    if (!employee || !fromSupervisor || !toSupervisor) {
      throw new Error("Invalid employee or supervisor ID");
    }

    this.removeEmployeeFromSupervisor(employee, toSupervisor);
    this.addEmployeeToSupervisor(employee, fromSupervisor);
  }

  redo(): void {
    const nextMove = this.history[this.history.length];
    if (!nextMove) {
      throw new Error("No moves to redo");
    }

    const { employeeID, fromSupervisorID, toSupervisorID } = nextMove;
    const employee = this.findEmployeeByID(employeeID);
    const fromSupervisor = this.findEmployeeByID(fromSupervisorID);
    const toSupervisor = this.findEmployeeByID(toSupervisorID);

    if (!employee || !fromSupervisor || !toSupervisor) {
      throw new Error("Invalid employee or supervisor ID");
    }

    this.removeEmployeeFromSupervisor(employee, fromSupervisor);
    this.addEmployeeToSupervisor(employee, toSupervisor);

    this.history.push(nextMove);
  }
}

// Example usage
const ceo: Employee = {
  uniqueId: 1,
  name: "John Smith",
  subordinates: [
    {
      uniqueId: 2,
      name: "Margot Donald",
      subordinates: [
        { uniqueId: 3, name: "Cassandra Reynolds", subordinates: [] },
        { uniqueId: 4, name: "Mary Blue", subordinates: [] },
        { uniqueId: 5, name: "Bob Saget", subordinates: [] },
        { uniqueId: 6, name: "Tina Teff", subordinates: [] },
        { uniqueId: 7, name: "Will Turner", subordinates: [] },
      ],
    },
    {
      uniqueId: 8,
      name: "Tyler Simpson",
      subordinates: [
        { uniqueId: 9, name: "Harry Tobs", subordinates: [] },
        { uniqueId: 10, name: "Thomas Brown", subordinates: [] },
        { uniqueId: 11, name: "George Carrey", subordinates: [] },
        { uniqueId: 12, name: "Gary Styles", subordinates: [] },
        { uniqueId: 13, name: "Ben Willis", subordinates: [] },
        { uniqueId: 14, name: "Georgina Flangy", subordinates: [] },
        { uniqueId: 15, name: "Sophie Turner", subordinates: [] },
      ],
    },
  ],
};

const app = new EmployeeOrgApp(ceo);
app.move(5, 14); // Move Bob Saget to be subordinate of Georgina
console.log(ceo);
app.undo(); // Undo the move
console.log(ceo);
app.redo(); // Redo the move
console.log(ceo);
