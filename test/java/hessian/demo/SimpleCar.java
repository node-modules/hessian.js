package hessian.demo;

public class SimpleCar implements Bean {
    private static final long serialVersionUID = 1385951785024582706L;

    private String name;
    private int num;
    private SimpleCar car;

    public SimpleCar() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getNum() {
        return num;
    }

    public void setNum(int num) {
        this.num = num;
    }

    public SimpleCar getCar() {
        return car;
    }

    public void setCar(SimpleCar car) {
        this.car = car;
    }

}
