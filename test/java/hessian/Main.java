package hessian;

import hessian.demo.Car;
import hessian.demo.CarSelf;
import hessian.demo.SimpleCar;
import hessian.demo.SomeArrayList;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.reflect.UndeclaredThrowableException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import com.caucho.hessian.io.Hessian2Output;
import com.caucho.hessian.io.HessianOutput;

public class Main {

	public static void main(String[] args) throws IOException {
//		HessianConvertor convertor = new HessianConvertor();
		byte[] bytes;
		FileOutputStream out;

		SimpleCar simpleCar = new SimpleCar();
	    simpleCar.setName("QQ");
	    simpleCar.setNum(10);

	    SimpleCar simpleCar2 = new SimpleCar();
	    simpleCar2.setName("QQ");
	    simpleCar2.setNum(10);
	    simpleCar.setCar(simpleCar2);

		bytes = writeObject(simpleCar);
		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/object/simpleCar.bin");
	    out.write(bytes);
	    out.close();
	    bytes = writeObject1(simpleCar);
		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/object/simpleCar.bin");
	    out.write(bytes);
	    out.close();

//		java.util.concurrent.atomic.AtomicLong a = new java.util.concurrent.atomic.AtomicLong(0);
//		bytes = writeObject(a);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/object/AtomicLong0.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(a);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/object/AtomicLong0.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    a.getAndIncrement();
//	    bytes = writeObject(a);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/object/AtomicLong1.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(a);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/object/AtomicLong1.bin");
//	    out.write(bytes);
//	    out.close();
//
//
//	    HashMap map = new HashMap();
//	    map.put("foo", "");
//	    bytes = writeObject(map);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/map/foo_empty.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(map);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/map/foo_empty.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    map = new HashMap();
//	    map.put("foo", "bar");
//	    map.put("中文key", "中文哈哈value");
//	    map.put("123", 456);
//	    map.put("zero", 0);
//	    bytes = writeObject(map);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/map/foo_bar.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(map);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/map/foo_bar.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    ArrayList list;
//
//	    list = new ArrayList();
//	    list.add(new Car("model 1"));
//	    list.add(new Car("model 2"));
//	    list.add(new Car("model 3"));
//	    bytes = writeObject(list);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/map/car_list.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(list);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/map/car_list.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    list = new ArrayList();
//	    list.add(new Car("model 1"));
//	    bytes = writeObject(list);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/map/one_car_list.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(list);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/map/one_car_list.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    list = new ArrayList();
//	    list.add(new Car("model 1"));
//	    list.add(new Car("model 2"));
//	    bytes = writeObject(list);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/map/two_car_list.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(list);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/map/two_car_list.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    Car car = new Car();
//	    bytes = writeObject(car);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/map/car.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(car);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/map/car.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    CarSelf car1 = new CarSelf();
//	    bytes = writeObject(car1);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/map/car1.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(car1);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/map/car1.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    CarSelf car2 = new CarSelf(car1);
//	    bytes = writeObject(car2);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/map/car2.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(car2);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/map/car2.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(0l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/0.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(0l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/0.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(-7l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/-7.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(-7l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/-7.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(-8l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/-8.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(-8l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/-8.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(15l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/15.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(15l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/15.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(14l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/14.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(14l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/14.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(-9l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/-9.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(-9l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/-9.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(16l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/16.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(16l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/16.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(255l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/255.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(255l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/255.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(-2048l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/-2048.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(-2048l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/-2048.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(2047l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/2047.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(2047l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/2047.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(262143l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/262143.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(262143l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/262143.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(-262144l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/-262144.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(-262144l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/-262144.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(2048l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/2048.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(2048l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/2048.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(-2049l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/-2049.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(-2049l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/-2049.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(-2147483648l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/-2147483648.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(-2147483648l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/-2147483648.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject(-2147483647l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/-2147483647.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(-2147483647l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/-2147483647.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(2147483647l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/2147483647.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(2147483647l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/2147483647.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(2147483646l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/2147483646.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(2147483646l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/2147483646.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(2147483648l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/long/2147483648.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(2147483648l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/long/2147483648.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)0);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/0.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)0);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/0.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)1.0);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/1.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)1.0);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/1.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)10);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/10.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)10);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/10.bin");
//	    out.write(bytes);
//	    out.close();
//
//		bytes = writeObject((double)10.1);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/10.1.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)10.1);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/10.1.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)-2147483649l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/-2147483649.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)-2147483649l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/-2147483649.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)-2147483648);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/-2147483648.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)-2147483648);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/-2147483648.bin");
//	    out.write(bytes);
//	    out.close();
//
//		bytes = writeObject((double)-0x800000);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/-0x800000.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject((double)-0x80000000);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/-0x80000000.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)-2147483647.0);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/-2147483647.0.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)-2147483647.0);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/-2147483647.0.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)-2147483647);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/-2147483647.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)-2147483647);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/-2147483647.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)-2147483610.123);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/-2147483610.123.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)-2147483610.123);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/-2147483610.123.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject((double)2147483647);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/2147483647.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)2147483647);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/2147483647.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)2147483648l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/2147483648.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)2147483648l);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/2147483648.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)2147483646);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/2147483646.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)2147483646);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/2147483646.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)2147483646.456);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/2147483646.456.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)2147483646.456);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/2147483646.456.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)10.123);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/10.123.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)10.123);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/10.123.bin");
//	    out.write(bytes);
//	    out.close();
//
//
//	    bytes = writeObject((double)-128);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/-128.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)-128);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/-128.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)-127.9999);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/-127.9999.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)-127.9999);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/-127.9999.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)127);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/127.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)127);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/127.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)126.9989);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/126.9989.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)126.9989);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/126.9989.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)-32768);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/-32768.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)-32768);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/-32768.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)-32767.999);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/-32767.999.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)-32767.999);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/-32767.999.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)32767);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/32767.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)32767);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/32767.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)32766.99999);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/32766.99999.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)32766.99999);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/32766.99999.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)32768);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/32768.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)32768);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/32768.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject((double)32767.99999);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/double/32767.99999.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((double)32767.99999);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/double/32767.99999.bin");
//	    out.write(bytes);
//	    out.close();
//
//
//		bytes = writeObject((Integer)null);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/null.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1((Integer)null);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/null.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(0);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/0.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(0);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/0.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject(10);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/10.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(10);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/10.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(16);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/16.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(16);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/16.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(-16);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/-16.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(-16);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/-16.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(1);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/1.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(1);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/1.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(46);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/46.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(46);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/46.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(47);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/47.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(47);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/47.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(-2048);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/-2048.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(-2048);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/-2048.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(-256);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/-256.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(-256);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/-256.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(255);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/255.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(255);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/255.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(256);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/256.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(256);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/256.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(2047);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/2047.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(2047);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/2047.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(-262144);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/-262144.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(-262144);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/-262144.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(262143);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/262143.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(262143);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/262143.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(262144);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/262144.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(262144);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/262144.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(-262145);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/number/-262145.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(-262145);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/number/-262145.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject("");
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/empty.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1("");
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/empty.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject("foo");
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/foo.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1("foo");
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/foo.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject("中文 Chinese");
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/chinese.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1("中文 Chinese");
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/chinese.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    File file = new File("/Users/mk2/git/hessian.js/test/fixtures/4k.txt");
//		@SuppressWarnings("resource")
//		FileInputStream fis1 = new FileInputStream(file);
//		byte[] b = new byte[fis1.available()];
//	    fis1.read(b);
//	    String text4k = new String(b);
//
//	    bytes = writeObject1(text4k);
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/text4k.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject("0123456789012345678901234567890");
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/0123456789012345678901234567890.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1("0123456789012345678901234567890");
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/0123456789012345678901234567890.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject("01234567890123456789012345678901");
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/01234567890123456789012345678901.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1("01234567890123456789012345678901");
//		out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/01234567890123456789012345678901.bin");
//	    out.write(bytes);
//	    out.close();
//
//		String largeString;
//		StringBuffer sb;
//
//		sb = new StringBuffer();
//		for (int i = 0; i < 32767; i++) {
//			sb.append("锋");
//	    }
//	    largeString = sb.toString();
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/utf8_32767.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/utf8_32767.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    sb = new StringBuffer();
//		for (int i = 0; i < 32768; i++) {
//			sb.append("锋");
//	    }
//	    largeString = sb.toString();
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/utf8_32768.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/utf8_32768.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    sb = new StringBuffer();
//		for (int i = 0; i < 32769; i++) {
//			sb.append("锋");
//	    }
//	    largeString = sb.toString();
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/utf8_32769.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/utf8_32769.bin");
//	    out.write(bytes);
//	    out.close();
//
//		sb = new StringBuffer();
//		for (int i = 0; i < 65534; i++) {
//			sb.append("锋");
//	    }
//	    largeString = sb.toString();
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/utf8_65534.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/utf8_65534.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    sb = new StringBuffer();
//		for (int i = 0; i < 65535; i++) {
//			sb.append("锋");
//	    }
//	    largeString = sb.toString();
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/utf8_65535.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/utf8_65535.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    sb = new StringBuffer();
//		for (int i = 0; i < 65536; i++) {
//			sb.append("锋");
//	    }
//	    largeString = sb.toString();
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/utf8_65536.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/utf8_65536.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    sb = new StringBuffer();
//		for (int i = 0; i < 65537; i++) {
//			sb.append("锋");
//	    }
//	    largeString = sb.toString();
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/utf8_65537.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/utf8_65537.bin");
//	    out.write(bytes);
//	    out.close();
//
//		byte[] largeBuf = new byte[65535];
//	    for (int i = 0; i < 65535; i++) {
//	    	largeBuf[i] = 0x41;
//	    }
//	    largeString = new String(largeBuf);
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/large_string_65535.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/large_string_65535.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    largeBuf = new byte[32767];
//	    for (int i = 0; i < 32767; i++) {
//	    	largeBuf[i] = 0x41;
//	    }
//	    largeString = new String(largeBuf);
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/large_string_32767.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/large_string_32767.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    largeBuf = new byte[32768];
//	    for (int i = 0; i < 32768; i++) {
//	    	largeBuf[i] = 0x41;
//	    }
//	    largeString = new String(largeBuf);
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/large_string_32768.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/large_string_32768.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    largeBuf = new byte[32769];
//	    for (int i = 0; i < 32769; i++) {
//	    	largeBuf[i] = 0x41;
//	    }
//	    largeString = new String(largeBuf);
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/large_string_32769.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/large_string_32769.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    largeBuf = new byte[65534];
//	    for (int i = 0; i < 65534; i++) {
//	    	largeBuf[i] = 0x41;
//	    }
//	    largeString = new String(largeBuf);
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/large_string_65534.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/large_string_65534.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    largeBuf = new byte[65536];
//	    for (int i = 0; i < 65536; i++) {
//	    	largeBuf[i] = 0x41;
//	    }
//	    largeString = new String(largeBuf);
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/large_string_65536.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/large_string_65536.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    largeBuf = new byte[65537];
//	    for (int i = 0; i < 65537; i++) {
//	    	largeBuf[i] = 0x41;
//	    }
//	    largeString = new String(largeBuf);
//	    bytes = writeObject(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/large_string_65537.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeString);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/large_string_65537.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/bytes/65535.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/bytes/65535.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    largeBuf = new byte[32769];
//	    for (int i = 0; i < 32769; i++) {
//	    	largeBuf[i] = 0x41;
//	    }
//	    bytes = writeObject(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/bytes/32769.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/bytes/32769.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    largeBuf = new byte[32768];
//	    for (int i = 0; i < 32768; i++) {
//	    	largeBuf[i] = 0x41;
//	    }
//	    bytes = writeObject(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/bytes/32768.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/bytes/32768.bin");
//	    out.write(bytes);
//	    out.close();
//	    largeBuf = new byte[32767];
//	    for (int i = 0; i < 32767; i++) {
//	    	largeBuf[i] = 0x41;
//	    }
//	    bytes = writeObject(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/bytes/32767.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/bytes/32767.bin");
//	    out.write(bytes);
//	    out.close();
//	    largeBuf = new byte[32769];
//	    for (int i = 0; i < 32769; i++) {
//	    	largeBuf[i] = 0x41;
//	    }
//	    bytes = writeObject(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/bytes/32769.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/bytes/32769.bin");
//	    out.write(bytes);
//	    out.close();
//	    largeBuf = new byte[42769];
//	    for (int i = 0; i < 42769; i++) {
//	    	largeBuf[i] = 0x41;
//	    }
//	    bytes = writeObject(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/bytes/42769.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/bytes/42769.bin");
//	    out.write(bytes);
//	    out.close();
//	    largeBuf = new byte[82769];
//	    for (int i = 0; i < 82769; i++) {
//	    	largeBuf[i] = 0x41;
//	    }
//	    bytes = writeObject(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/bytes/82769.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(largeBuf);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/bytes/82769.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    char[] cs = new char[65535];
//	    cs[0] = 0xd800;
//	    cs[1] = 0xdbff;
//	    for (int i = 0; i < 65535; i += 2) {
//	    	cs[i] = 0xd800;
//	    	if (i+1 < 65535) {
//	    		cs[i+1] = 0xdbff;
//	    	}
//	    }
//	    String large2 = new String(cs);
//	    bytes = writeObject(large2);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/large_string_chars.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(large2);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/string/large_string_chars.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    cs = new char[65536];
//	    cs[0] = 0xd800;
//	    cs[1] = 0xdbff;
//	    for (int i = 0; i < 65536; i += 2) {
//	    	cs[i] = 0xd800;
//	    	if (i+1 < 65536) {
//	    		if (i+1 == 65535) {
//	    			cs[i+1] = 0x41;
//	    		} else {
//	    			cs[i+1] = 0xdbff;
//	    		}
//	    	}
//	    }
//	    String large3 = new String(cs);
//	    bytes = writeObject(large3);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/string/large_string_chars_65536.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    long ts = Date.parse("Wed Apr 23 13:15:14 CST 2014");
//	    Date now = new Date(ts);
//	    bytes = writeObject(now);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/date/now.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(now);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/date/now.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    now = new Date(894621060000l);
//	    bytes = writeObject(now);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/date/894621060000.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(now);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/date/894621060000.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    now = new Date(894621091000l);
//	    bytes = writeObject(now);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/date/894621091000.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(now);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/date/894621091000.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(Color.RED);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/enum/red.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(Color.RED);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/enum/red.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(Color.GREEN);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/enum/green.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(Color.GREEN);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/enum/green.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    bytes = writeObject(Color.BLUE);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/enum/blue.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(Color.BLUE);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/enum/blue.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    list = new ArrayList();
//	    list.add(Color.BLUE);
//	    list.add(Color.RED);
//	    list.add(Color.GREEN);
//	    bytes = writeObject(list);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/enum/lists.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(list);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/enum/lists.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    list = new ArrayList();
//	    list.add(1);
//	    list.add(2);
//	    list.add("foo");
//	    bytes = writeObject(list);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/list/untyped_list.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(list);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/list/untyped_list.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    list = new ArrayList();
//	    bytes = writeObject(list);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/list/untyped_[].bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(list);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/list/untyped_[].bin");
//	    out.write(bytes);
//	    out.close();
//
//	    list = new ArrayList<String>();
//	    list.add("foo");
//	    list.add("bar");
//	    bytes = writeObject(list);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/list/untyped_<String>[foo,bar].bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(list);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/list/untyped_<String>[foo,bar].bin");
//	    out.write(bytes);
//	    out.close();
//
//	    list = new SomeArrayList();
//	    list.add("ok");
//	    list.add("some list");
//	    bytes = writeObject(list);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/list/typed_list.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(list);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/list/typed_list.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    int[] ints = new int[] {1, 2, 3};
//	    bytes = writeObject(ints);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/list/[int.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(ints);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/list/[int.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    String[] strs = new String[] {"1", "@", "3"};
//	    bytes = writeObject(strs);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/list/[string.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(strs);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/list/[string.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    IOException ioe = new IOException("this is a java IOException instance");
//	    bytes = writeObject(ioe);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/exception/IOException.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(ioe);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/exception/IOException.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    UndeclaredThrowableException ute = new UndeclaredThrowableException(ioe);
//	    bytes = writeObject(ute);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/exception/UndeclaredThrowableException.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(ute);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/exception/UndeclaredThrowableException.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    UndeclaredThrowableException ute2 = new UndeclaredThrowableException(ioe, "模拟测试异常");
//	    bytes = writeObject(ute2);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/exception/UndeclaredThrowableException2.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(ute2);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/exception/UndeclaredThrowableException2.bin");
//	    out.write(bytes);
//	    out.close();
//
//	    ConnectionRequest connreq = new ConnectionRequest();
//	    bytes = writeObject(connreq);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v2/object/ConnectionRequest.bin");
//	    out.write(bytes);
//	    out.close();
//	    bytes = writeObject1(connreq);
//	    out = new FileOutputStream("/Users/mk2/git/hessian.js/test/fixtures/v1/object/ConnectionRequest.bin");
//	    out.write(bytes);
//	    out.close();
	}

	enum Color {
        RED,
        GREEN,
        BLUE,
    }

	static byte[] writeObject(Object obj) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        Hessian2Output out = new Hessian2Output(bos);
        out.writeObject(obj);
        out.close();
        return bos.toByteArray();
    }

	static byte[] writeObject1(Object obj) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        HessianOutput out = new HessianOutput(bos);
        out.writeObject(obj);
        out.close();
        return bos.toByteArray();
    }
}
